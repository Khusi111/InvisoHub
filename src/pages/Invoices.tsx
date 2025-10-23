import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import { useNavigate } from "react-router-dom"
import { getInvoices, deleteInvoice, finalizeInvoice } from "@/api/invoices"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Send,
  Download,
  CheckCircle,
  Clock,
  FileText,
  Filter
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

interface Invoice {
  _id: string
  invoiceNumber: string
  clientId: string
  clientName: string
  clientState: string
  issueDate: string
  dueDate: string
  status: string
  subtotal: number
  gstAmount: number
  total: number
  lineItems: Array<any>
  notes?: string
  referenceNumber?: string
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  finalized: { label: 'Finalized', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  sent: { label: 'Sent', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
}

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    let filtered = invoices.filter(invoice =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.referenceNumber && invoice.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    setFilteredInvoices(filtered)
  }, [invoices, searchTerm, statusFilter])

  const fetchInvoices = async () => {
    try {
      console.log('Fetching invoices...')
      const response = await getInvoices()
      setInvoices((response as any).invoices)
      console.log('Invoices loaded successfully')
    } catch (error: any) {
      console.error('Error fetching invoices:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load invoices",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      console.log('Deleting invoice:', invoiceId)
      await deleteInvoice(invoiceId)
      setInvoices(invoices.filter(invoice => invoice._id !== invoiceId))
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      })
    } catch (error: any) {
      console.error('Error deleting invoice:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      })
    }
  }

  const handleFinalizeInvoice = async (invoiceId: string) => {
    try {
      console.log('Finalizing invoice:', invoiceId)
      await finalizeInvoice(invoiceId)
      setInvoices(invoices.map(invoice => 
        invoice._id === invoiceId 
          ? { ...invoice, status: 'finalized' }
          : invoice
      ))
      toast({
        title: "Success",
        description: "Invoice finalized successfully",
      })
    } catch (error: any) {
      console.error('Error finalizing invoice:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to finalize invoice",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4" />
      case 'finalized':
      case 'sent':
      case 'paid':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-slate-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-200 rounded w-32"></div>
                    <div className="h-4 bg-slate-200 rounded w-48"></div>
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
            Invoices
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your invoices and track payments.
          </p>
        </div>
        <Button
          onClick={() => navigate('/invoices/create')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
              <Filter className="h-4 w-4 mr-2" />
              {statusFilter === 'all' ? 'All Status' : statusConfig[statusFilter as keyof typeof statusConfig]?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900">
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              All Status
            </DropdownMenuItem>
            {Object.entries(statusConfig).map(([status, config]) => (
              <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No invoices found' : 'No invoices yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                : 'Get started by creating your first invoice to begin tracking your business transactions.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button
                onClick={() => navigate('/invoices/create')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Invoice
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice._id} className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-200 dark:bg-slate-900/80 dark:border-slate-700/60 group">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {invoice.invoiceNumber}
                      </h3>
                      <Badge className={statusConfig[invoice.status as keyof typeof statusConfig]?.color}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(invoice.status)}
                          <span>{statusConfig[invoice.status as keyof typeof statusConfig]?.label}</span>
                        </div>
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-1 sm:space-y-0 text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{invoice.clientName}</span>
                      <span>Issue: {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</span>
                      <span>Due: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</span>
                      {invoice.referenceNumber && (
                        <span>Ref: {invoice.referenceNumber}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(invoice.total)}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        GST: {formatCurrency(invoice.gstAmount)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/invoices/edit/${invoice._id}`)}
                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {invoice.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFinalizeInvoice(invoice._id)}
                          className="h-8 w-8 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white dark:bg-slate-900">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete invoice {invoice.invoiceNumber}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteInvoice(invoice._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}