import { motion } from 'framer-motion'
import { DollarSign, Users, FileText, Receipt, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface FinancialCounts {
  totalClients: number
  pendingInvoices: number
  totalRevenue: number
  unpaidAmount: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25
    }
  }
}

export function DashboardCards() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [financialCounts, setFinancialCounts] = useState<FinancialCounts>({
    totalClients: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    unpaidAmount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      const [clientsRes, pendingRes, paidRes, unpaidRes] = await Promise.all([
        supabase
          .from('clients')
          .select('id')
          .eq('user_id', user.id),
        
        supabase
          .from('invoices')
          .select('id')
          .eq('user_id', user.id)
          .in('status', ['draft', 'sent']),
        
        supabase
          .from('invoices')
          .select('total')
          .eq('user_id', user.id)
          .eq('status', 'paid'),
        
        supabase
          .from('invoices')
          .select('total')
          .eq('user_id', user.id)
          .in('status', ['sent', 'overdue'])
      ])

      const totalRevenue = paidRes.data?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
      const unpaidAmount = unpaidRes.data?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

      setFinancialCounts({
        totalClients: clientsRes.data?.length || 0,
        pendingInvoices: pendingRes.data?.length || 0,
        totalRevenue,
        unpaidAmount
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-32 mb-2"></div>
              <div className="h-3 bg-muted rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/clients')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialCounts.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Active client relationships
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/invoices')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialCounts.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(financialCounts.unpaidAmount)} outstanding
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialCounts.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From paid invoices
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/quotes')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quick Actions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); navigate('/invoices'); }}>
              New Invoice
            </Button>
            <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); navigate('/quotes'); }}>
              New Quote
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
