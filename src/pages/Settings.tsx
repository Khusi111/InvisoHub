import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/useToast"
import { getCompanyProfile, updateCompanyProfile } from "@/api/companies"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Building,
  Palette,
  Users,
  Save,
  Upload,
  Loader2,
  ImageIcon
} from "lucide-react"

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  gstin: z.string().min(1, "GSTIN is required"),
  bankDetails: z.object({
    accountName: z.string().min(1, "Account name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    ifsc: z.string().min(1, "IFSC code is required"),
    bankName: z.string().min(1, "Bank name is required"),
  }),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyProfile {
  _id: string
  name: string
  code: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  gstin: string
  logo?: string
  bankDetails: {
    accountName: string
    accountNumber: string
    ifsc: string
    bankName: string
  }
}

export function Settings() {
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
  const [logoError, setLogoError] = useState(false)
  const { toast } = useToast()

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      gstin: "",
      bankDetails: {
        accountName: "",
        accountNumber: "",
        ifsc: "",
        bankName: "",
      },
    },
  })

  useEffect(() => {
    fetchCompanyProfile()
  }, [])

  const fetchCompanyProfile = async () => {
    try {
      console.log('Fetching company profile...')
      const response = await getCompanyProfile()
      const profile = (response as any).company
      setCompanyProfile(profile)

      form.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        gstin: profile.gstin,
        bankDetails: profile.bankDetails,
      })

      console.log('Company profile loaded successfully')
    } catch (error: any) {
      console.error('Error fetching company profile:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load company profile",
        variant: "destructive",
      })
    } finally {
      setPageLoading(false)
    }
  }

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setLoading(true)
      console.log('Updating company profile:', data)

      await updateCompanyProfile(data)

      toast({
        title: "Success",
        description: "Company profile updated successfully",
      })

      fetchCompanyProfile()
    } catch (error: any) {
      console.error('Error updating company profile:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update company profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageError = () => {
    setLogoError(true)
  }

  const handleImageLoad = () => {
    setLogoError(false)
  }

  if (pageLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        <div className="space-y-4">
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your company profile and application preferences.
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="company" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Company</span>
          </TabsTrigger>
          <TabsTrigger value="invoice" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Invoice</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60">
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Logo</label>
                    <div className="flex items-center space-x-4">
                      {companyProfile?.logo && !logoError ? (
                        <img
                          src={companyProfile.logo}
                          alt="Company Logo"
                          className="w-16 h-16 object-contain bg-slate-100 rounded-lg p-2 dark:bg-slate-800"
                          onError={handleImageError}
                          onLoad={handleImageLoad}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-lg p-2 dark:bg-slate-800 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                    {logoError && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Logo could not be loaded. Please upload a new logo.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company Code</label>
                      <Input
                        value={companyProfile?.code || ""}
                        disabled
                        className="bg-slate-50 dark:bg-slate-800"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Company code cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter complete address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter pincode" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="gstin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GSTIN *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter GSTIN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60">
                <CardHeader>
                  <CardTitle>Bank Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankDetails.accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankDetails.accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankDetails.ifsc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter IFSC code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankDetails.bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bank name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="invoice">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60">
            <CardHeader>
              <CardTitle>Invoice Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Invoice Color Theme</label>
                  <div className="flex space-x-2 mt-2">
                    {['blue', 'green', 'purple', 'red', 'orange'].map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full bg-${color}-600 hover:scale-110 transition-transform`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Number Format</label>
                  <Input
                    placeholder="INV-{YYYY}-{###}"
                    defaultValue="INV-{YYYY}-{###}"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Use {"{YYYY}"} for year, {"{MM}"} for month, {"{###}"} for sequential number
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Payment Terms</label>
                  <Input
                    placeholder="Payment due within 30 days"
                    defaultValue="Payment due within 30 days"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Footer Text</label>
                  <Textarea
                    placeholder="Thank you for your business!"
                    defaultValue="Thank you for your business!"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                  <Save className="h-4 w-4 mr-2" />
                  Save Invoice Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  User Management Coming Soon
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  This feature will allow you to invite team members and manage user roles.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}