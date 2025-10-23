import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import { getClients, deleteClient } from "@/api/clients"
import { ClientDialog } from "@/components/ClientDialog"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin,
  Building,
  Globe,
  FileText
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

interface Client {
  _id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  gstin?: string
  website?: string
  notes?: string
}

export function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.gstin && client.gstin.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredClients(filtered)
  }, [clients, searchTerm])

  const fetchClients = async () => {
    try {
      console.log('Fetching clients...')
      const response = await getClients()
      setClients((response as any).clients)
      console.log('Clients loaded successfully')
    } catch (error: any) {
      console.error('Error fetching clients:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load clients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    try {
      console.log('Deleting client:', clientId)
      await deleteClient(clientId)
      setClients(clients.filter(client => client._id !== clientId))
      toast({
        title: "Success",
        description: "Client deleted successfully",
      })
    } catch (error: any) {
      console.error('Error deleting client:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      })
    }
  }

  const handleClientSaved = () => {
    fetchClients()
    setDialogOpen(false)
    setEditingClient(null)
  }

  const openEditDialog = (client: Client) => {
    setEditingClient(client)
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingClient(null)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-slate-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
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
            Clients
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your client relationships and contact information.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60"
        />
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms to find what you\'re looking for.'
                : 'Get started by adding your first client to begin managing your business relationships.'
              }
            </p>
            {!searchTerm && (
              <Button
                onClick={openCreateDialog}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client._id} className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-200 dark:bg-slate-900/80 dark:border-slate-700/60 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {client.name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {client.contactPerson}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(client)}
                      className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Edit className="h-4 w-4" />
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
                          <AlertDialogTitle>Delete Client</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {client.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteClient(client._id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{client.city}, {client.state}</span>
                </div>
                {client.website && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Globe className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{client.website}</span>
                  </div>
                )}
                {client.gstin && (
                  <div className="pt-2">
                    <Badge variant="secondary" className="text-xs">
                      GST: {client.gstin}
                    </Badge>
                  </div>
                )}
                {client.notes && (
                  <div className="pt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {client.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client Dialog */}
      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editingClient}
        onSaved={handleClientSaved}
      />
    </div>
  )
}