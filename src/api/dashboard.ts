import api from './api';

// Description: Get dashboard statistics
// Endpoint: GET /api/dashboard/stats
// Request: {}
// Response: { stats: { totalRevenue: number, outstandingPayments: number, totalInvoices: number, totalClients: number, monthlyRevenue: Array<object>, paymentStatus: Array<object> } }
export const getDashboardStats = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        stats: {
          totalRevenue: 125000,
          outstandingPayments: 45000,
          totalInvoices: 24,
          totalClients: 8,
          monthlyRevenue: [
            { month: 'Jan', revenue: 25000 },
            { month: 'Feb', revenue: 30000 },
            { month: 'Mar', revenue: 35000 },
            { month: 'Apr', revenue: 28000 },
            { month: 'May', revenue: 32000 },
            { month: 'Jun', revenue: 40000 }
          ],
          paymentStatus: [
            { status: 'Paid', count: 15, amount: 80000 },
            { status: 'Pending', count: 6, amount: 35000 },
            { status: 'Overdue', count: 3, amount: 10000 }
          ]
        }
      });
    }, 500);
  });
};

// Description: Get recent activities
// Endpoint: GET /api/dashboard/activities
// Request: {}
// Response: { activities: Array<{ _id: string, type: string, description: string, timestamp: string, invoiceNumber?: string }> }
export const getRecentActivities = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        activities: [
          {
            _id: '1',
            type: 'invoice_created',
            description: 'Invoice INV-2024-003 created for ABC Industries',
            timestamp: '2024-01-22T10:30:00Z',
            invoiceNumber: 'INV-2024-003'
          },
          {
            _id: '2',
            type: 'payment_received',
            description: 'Payment received for Invoice INV-2024-001',
            timestamp: '2024-01-21T15:45:00Z',
            invoiceNumber: 'INV-2024-001'
          },
          {
            _id: '3',
            type: 'client_added',
            description: 'New client "Tech Solutions Ltd" added',
            timestamp: '2024-01-20T09:15:00Z'
          },
          {
            _id: '4',
            type: 'invoice_sent',
            description: 'Invoice INV-2024-002 sent to XYZ Enterprises',
            timestamp: '2024-01-19T14:20:00Z',
            invoiceNumber: 'INV-2024-002'
          }
        ]
      });
    }, 500);
  });
};