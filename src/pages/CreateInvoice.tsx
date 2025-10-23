import { useState, useEffect, useRef } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/useToast"
import { useNavigate } from "react-router-dom"
import { getClients } from "@/api/clients"
import { createInvoice } from "@/api/invoices"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ArrowLeft, Save, Send, Loader2, Download } from "lucide-react"
import html2pdf from "html2pdf.js"
import { InvoiceTemplate } from "@/components/InvoiceTemplate"

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  hsn: z.string().optional(),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0.01, "Unit price must be greater than 0"),
  taxRate: z.number().min(0).max(100, "Tax rate must be between 0 and 100"),
  discount: z.number().min(0).max(100).optional(),
})

const invoiceSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  gstin: z.string().min(1, "GSTIN is required"),
  email: z.string().email(),
  phone: z.string().min(5),
  clientId: z.string().min(1, "Please select a client"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  notes: z.string().optional(),
  overallDiscount: z.number().min(0).max(100).optional(),
  additionalCharges: z.number().min(0).optional(),
  logo: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface Client {
  _id: string
  name: string
  state: string
  gstin?: string
}

const generateInvoiceNumber = (count = 1) => {
  return `INV-${String(count).padStart(6, "0")}`
}

export function CreateInvoice() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [clientsLoading, setClientsLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()
  const invoiceRef = useRef<HTMLDivElement>(null)

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      companyName: "",
      companyAddress: "",
      gstin: "",
      email: "",
      phone: "",
      clientId: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      invoiceNumber: generateInvoiceNumber(1),
      lineItems: [{ description: "", hsn: "", quantity: 1, unitPrice: 0, taxRate: 18, discount: 0 }],
      notes: "",
      overallDiscount: 0,
      additionalCharges: 0,
      logo: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await getClients()
      console.log("Fetched clients:", response.clients)
      setClients(response.clients)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to load clients", variant: "destructive" })
    } finally {
      setClientsLoading(false)
    }
  }

  const calculateInvoiceTotals = () => {
    const lineItems = form.watch("lineItems")
    const overallDiscount = form.watch("overallDiscount") || 0
    const additionalCharges = form.watch("additionalCharges") || 0

    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const discounts = lineItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      return sum + (itemSubtotal * (item.discount || 0)) / 100
    }, 0)

    const afterDiscounts = subtotal - discounts - (subtotal * overallDiscount) / 100
    const gstAmount = lineItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100
      const afterItemDiscount = itemSubtotal - itemDiscount
      const afterOverallDiscount = afterItemDiscount - (afterItemDiscount * overallDiscount) / 100
      return sum + (afterOverallDiscount * item.taxRate) / 100
    }, 0)

    const total = afterDiscounts + gstAmount + additionalCharges
    return { subtotal, gstAmount, total }
  }

  const totals = calculateInvoiceTotals()

  const onSubmit = async (data: InvoiceFormData, isDraft = false) => {
    try {
      setLoading(true)
      const invoiceData = { ...data, status: isDraft ? "draft" : "finalized", ...totals }
      await createInvoice(invoiceData)

      toast({ title: "Success", description: `Invoice ${isDraft ? "saved as draft" : "created"} successfully` })
      navigate("/invoices")
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create invoice", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return
    html2pdf()
      .from(invoiceRef.current)
      .set({
        margin: 10,
        filename: "invoice.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate("/invoices")} className="text-slate-600">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Invoice</h1>
          <p className="text-slate-600 mt-1">Fill in the details below to generate an invoice.</p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <Input {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Address *</FormLabel>
                    <Textarea {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN *</FormLabel>
                    <Input {...field} />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <Input {...field} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <Input {...field} />
                    </FormItem>
                  )}
                />
              </div>

              {/* Logo Upload */}
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Logo</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            field.onChange(reader.result) // save base64 in form
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                    {field.value && (
                      <div className="mt-2">
                        <img
                          src={field.value}
                          alt="Company Logo Preview"
                          className="h-20 object-contain border rounded"
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Client Info & Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client *</FormLabel>
                      <Select onValueChange={(value) => { field.onChange(value); console.log("Client selected:", value); }} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clientsLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : (
                            clients.map((client) => (
                              <SelectItem key={client._id} value={client._id}>
                                {client.name} - {client.state}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice # *</FormLabel>
                      <Input {...field} readOnly />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date *</FormLabel>
                      <Input type="date" {...field} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date *</FormLabel>
                      <Input type="date" {...field} />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items Section */}
          <Card>
            <CardHeader>
              <CardTitle>Items & Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="table-auto w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">#</th>
                      <th className="border px-2 py-1">Item & Description</th>
                      <th className="border px-2 py-1">HSN/SAC</th>
                      <th className="border px-2 py-1">Qty</th>
                      <th className="border px-2 py-1">Rate</th>
                      <th className="border px-2 py-1">Amount</th>
                      <th className="border px-2 py-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <tr key={field.id}>
                        <td className="border px-2 py-1 text-center">{index + 1}</td>
                        <td className="border px-2 py-1">
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.description`}
                            render={({ field }) => <Input {...field} placeholder="Item description" />}
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.hsn`}
                            render={({ field }) => <Input {...field} placeholder="HSN/SAC" />}
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.quantity`}
                            render={({ field }) => <Input type="number" {...field} min={1} />}
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <FormField
                            control={form.control}
                            name={`lineItems.${index}.unitPrice`}
                            render={({ field }) => <Input type="number" {...field} min={0} />}
                          />
                        </td>
                        <td className="border px-2 py-1">
                          ₹{(form.watch(`lineItems.${index}.quantity`) * form.watch(`lineItems.${index}.unitPrice`)).toFixed(2)}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => append({ description: "", hsn: "", quantity: 1, unitPrice: 0, taxRate: 18, discount: 0 })}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              {/* Totals Section */}
              <div className="mt-4 space-y-1">
                <div>Subtotal: ₹{totals.subtotal.toFixed(2)}</div>
                <div>CGST: ₹{(totals.gstAmount / 2).toFixed(2)}</div>
                <div>SGST: ₹{(totals.gstAmount / 2).toFixed(2)}</div>
                <div>IGST: ₹0.00</div>
                <div>Total: ₹{totals.total.toFixed(2)}</div>
                <div>Less: TDS (if applicable): ₹0.00</div>
                <div>Balance Due: ₹{totals.total.toFixed(2)}</div>
                <div>Notes / Terms & Conditions:</div>
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <Textarea {...field} placeholder="Payment due within 7 days." />
                )} />
                <div>Payment Due Date: {form.watch("dueDate")}</div>
                <div>Authorized Signature: ___________________</div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={form.handleSubmit((d) => onSubmit(d, true))} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Draft
            </Button>
            <Button type="button" onClick={form.handleSubmit((d) => onSubmit(d, false))} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Create Invoice
            </Button>
            <Button type="button" variant="secondary" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
          </div>
        </form>
      </Form>

      {/* Off-screen Invoice Preview for PDF */}
      <div className="absolute -left-[9999px] top-0">
        <div ref={invoiceRef}>
          <InvoiceTemplate
            company={{
              name: form.watch("companyName"),
              address: form.watch("companyAddress"),
              gstin: form.watch("gstin"),
              email: form.watch("email"),
              phone: form.watch("phone"),
              logo: form.watch("logo"),
            }}
            client={{
              name: "Client Name",
              address: "Client Address, City, State",
              gstin: "22XYZ9876L9K0",
            }}
            invoice={{
              number: form.watch("invoiceNumber"),
              issueDate: form.watch("issueDate"),
              dueDate: form.watch("dueDate"),
              placeOfSupply: "Odisha",
              subject: "Invoice for services",
              items: form.watch("lineItems").map((item, i) => ({
                description: item.description,
                hsn: "998314",
                qty: item.quantity,
                rate: item.unitPrice,
                cgst: item.taxRate / 2,
                sgst: item.taxRate / 2,
                amount: item.quantity * item.unitPrice,
              })),
              bankDetails: {
                bankName: "State Bank of India",
                accountName: form.watch("companyName"),
                accountNumber: "123456789",
                ifsc: "SBIN0001234",
              },
              terms: form.watch("notes") || "Payment due within 7 days.",
              declaration: "This is a system-generated invoice.",
            }}
          />
        </div>
      </div>
    </div>
  )
}