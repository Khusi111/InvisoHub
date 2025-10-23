import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/useToast"
import { getClients } from "@/api/clients"
import { getInvoiceById, updateInvoice } from "@/api/invoices"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Trash2,
  ArrowLeft,
  Calculator,
  Save,
  Send,
  Loader2
} from "lucide-react"

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0.01, "Unit price must be greater than 0"),
  taxRate: z.number().min(0).max(100, "Tax rate must be between 0 and 100"),
  discount: z.number().min(0).max(100, "Discount must be between 0 and 100").optional(),
})

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  referenceNumber: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  notes: z.string().optional(),
  overallDiscount: z.number().min(0).max(100, "Overall discount must be between 0 and 100").optional(),
  additionalCharges: z.number().min(0, "Additional charges must be positive").optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface Client {
  _id: string
  name: string
  state: string
  gstin?: string
}

export function EditInvoice() {
  const { id } = useParams<{ id: string }>()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: "",
      issueDate: "",
      dueDate: "",
      referenceNumber: "",
      lineItems: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 18,
          discount: 0,
        }
      ],
      notes: "",
      overallDiscount: 0,
      additionalCharges: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  })

  useEffect(() => {
    if (id) {
      fetchInvoiceAndClients()
    }
  }, [id])

  const fetchInvoiceAndClients = async () => {
    try {
      console.log('Fetching invoice and clients for editing...')
      const [invoiceResponse, clientsResponse] = await Promise.all([
        getInvoiceById(id!),
        getClients()
      ])

      const invoice = (invoiceResponse as any).invoice
      const clients = (clientsResponse as any).clients

      setClients(clients)

      // Populate form with invoice data
      form.reset({
        clientId: invoice.clientId,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        referenceNumber: invoice.referenceNumber || "",
        lineItems: invoice.lineItems.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          discount: item.discount || 0,
        })),
        notes: invoice.notes || "",
        overallDiscount: 0,
        additionalCharges: 0,
      })

      console.log('Invoice and clients loaded successfully')
    } catch (error: any) {
      console.error('Error fetching invoice data:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load invoice data",
        variant: "destructive",
      })
      navigate('/invoices')
    } finally {
      setPageLoading(false)
    }
  }

  const calculateLineItemTotal = (item: any) => {
    const subtotal = item.quantity * item.unitPrice
    const discountAmount = (subtotal * (item.discount || 0)) / 100
    const afterDiscount = subtotal - discountAmount
    const taxAmount = (afterDiscount * item.taxRate) / 100
    return afterDiscount + taxAmount
  }

  const calculateInvoiceTotals = () => {
    const lineItems = form.watch("lineItems")
    const overallDiscount = form.watch("overallDiscount") || 0
    const additionalCharges = form.watch("additionalCharges") || 0

    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)

    const lineItemDiscounts = lineItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      return sum + ((itemSubtotal * (item.discount || 0)) / 100)
    }, 0)

    const afterLineDiscounts = subtotal - lineItemDiscounts
    const overallDiscountAmount = (afterLineDiscounts * overallDiscount) / 100
    const afterAllDiscounts = afterLineDiscounts - overallDiscountAmount

    const gstAmount = lineItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      const itemDiscount = (itemSubtotal * (item.discount || 0)) / 100
      const afterItemDiscount = itemSubtotal - itemDiscount
      const afterOverallDiscount = afterItemDiscount - ((afterItemDiscount * overallDiscount) / 100)
      return sum + ((afterOverallDiscount * item.taxRate) / 100)
    }, 0)

    const total = afterAllDiscounts + gstAmount + additionalCharges

    return {
      subtotal,
      gstAmount,
      total,
      overallDiscountAmount,
    }
  }

  const totals = calculateInvoiceTotals()

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      setLoading(true)
      console.log('Updating invoice:', data)

      const invoiceData = {
        ...data,
        subtotal: totals.subtotal,
        gstAmount: totals.gstAmount,
        total: totals.total,
      }

      await updateInvoice(id!, invoiceData)
      
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      })

      navigate('/invoices')
    } catch (error: any) {
      console.error('Error updating invoice:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addLineItem = () => {
    append({
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 18,
      discount: 0,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  if (pageLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-10 bg-slate-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded w-32"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-10 bg-slate-200 rounded"></div>
                    <div className="h-10 bg-slate-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/invoices')}
          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
            Edit Invoice
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Update invoice details and line items.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Invoice Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60">
                <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a client" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-slate-900">
                              {clients.map((client) => (
                                <SelectItem key={client._id} value={client._id}>
                                  {client.name} - {client.state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="referenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number</FormLabel>
                          <FormControl>
                            <Input placeholder="PO number or reference" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="issueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Line Items</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLineItem}
                      className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border border-slate-200 rounded-lg dark:border-slate-700 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          Item {index + 1}
                        </h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Input placeholder="Product or service description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Price *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.taxRate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tax Rate (%)</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseFloat(value))} value={field.value.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white dark:bg-slate-900">
                                  <SelectItem value="0">0%</SelectItem>
                                  <SelectItem value="5">5%</SelectItem>
                                  <SelectItem value="12">12%</SelectItem>
                                  <SelectItem value="18">18%</SelectItem>
                                  <SelectItem value="28">28%</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.discount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="text-right">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Line Total: {formatCurrency(calculateLineItemTotal(form.watch(`lineItems.${index}`)))}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60">
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Payment terms, special instructions, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Invoice Summary */}
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60 sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Invoice Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">GST Amount:</span>
                      <span className="font-medium">{formatCurrency(totals.gstAmount)}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span className="text-blue-600 dark:text-blue-400">{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      Update Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}