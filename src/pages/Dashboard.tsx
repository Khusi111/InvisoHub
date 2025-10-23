import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/useToast"
import { getDashboardStats, getRecentActivities } from "@/api/dashboard"
import { 
  DollarSign, 
  FileText, 
  Users, 
  Clock,
  TrendingUp,
  Plus,
  Eye,
  ArrowUpRight
} from "lucide-react"
import { format } from "date-fns"

interface DashboardStats {
  totalRevenue: number
  outstandingPayments: number
  totalInvoices: number
  totalClients: number
  monthlyRevenue: Array<{ month: string; revenue: number }>
  paymentStatus: Array<{ status: string; count: number; amount: number }>
}

interface Activity {
  _id: string
  type: string
  description: string
  timestamp: string
  invoiceNumber?: string
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Fetching dashboard data...')
        const [statsResponse, activitiesResponse] = await Promise.all([
          getDashboardStats(),
          getRecentActivities()
        ])
        
        setStats((statsResponse as any).stats)
        setActivities((activitiesResponse as any).activities)
        console.log('Dashboard data loaded successfully')
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: "Error",
          description: error.message || "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice_created':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'payment_received':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'client_added':
        return <Users className="h-4 w-4 text-purple-600" />
      case 'invoice_sent':
        return <ArrowUpRight className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button
            onClick={() => navigate('/clients')}
            variant="outline"
            className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Clients
          </Button>
          <Button
            onClick={() => navigate('/invoices/create')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60 dark:from-blue-950/50 dark:to-indigo-950/50 dark:border-blue-800/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Revenue
            </CardTitle>
            <div className="p-2 bg-blue-600 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/60 dark:from-emerald-950/50 dark:to-teal-950/50 dark:border-emerald-800/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Outstanding Payments
            </CardTitle>
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {formatCurrency(stats?.outstandingPayments || 0)}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              6 pending invoices
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/60 dark:from-purple-950/50 dark:to-pink-950/50 dark:border-purple-800/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Total Invoices
            </CardTitle>
            <div className="p-2 bg-purple-600 rounded-lg">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats?.totalInvoices || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              3 drafts, 21 finalized
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/60 dark:from-orange-950/50 dark:to-red-950/50 dark:border-orange-800/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Total Clients
            </CardTitle>
            <div className="p-2 bg-orange-600 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats?.totalClients || 0}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              2 new this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity._id} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/80 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-700/80">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {format(new Date(activity.timestamp), 'MMM dd, yyyy at h:mm a')}
                    </p>
                  </div>
                  {activity.invoiceNumber && (
                    <Badge variant="secondary" className="text-xs">
                      {activity.invoiceNumber}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="ghost"
                className="w-full text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                onClick={() => navigate('/invoices')}
              >
                <Eye className="h-4 w-4 mr-2" />
                View All Activities
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => navigate('/invoices/create')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Invoice
            </Button>
            <Button
              onClick={() => navigate('/clients')}
              variant="outline"
              className="w-full border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Users className="h-4 w-4 mr-2" />
              Add New Client
            </Button>
            <Button
              onClick={() => navigate('/invoices')}
              variant="outline"
              className="w-full border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <FileText className="h-4 w-4 mr-2" />
              View All Invoices
            </Button>
            <Button
              onClick={() => navigate('/settings')}
              variant="outline"
              className="w-full border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}