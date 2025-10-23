import api from './api';

// Description: Get all invoices for the company
// Endpoint: GET /api/invoices
// Request: {}
// Response: { invoices: Array<{ _id: string, invoiceNumber: string, clientId: string, clientName: string, issueDate: string, dueDate: string, status: string, subtotal: number, gstAmount: number, total: number, lineItems: Array<object> }> }
export const getInvoices = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        invoices: [
          {
            _id: '507f1f77bcf86cd799439015',
            invoiceNumber: 'INV-2024-001',
            clientId: '507f1f77bcf86cd799439012',
            clientName: 'ABC Industries',
            clientState: 'Delhi',
            issueDate: '2024-01-15',
            dueDate: '2024-02-15',
            status: 'finalized',
            subtotal: 10000,
            gstAmount: 1800,
            total: 11800,
            lineItems: [
              {
                description: 'Web Development Services',
                quantity: 1,
                unitPrice: 10000,
                taxRate: 18,
                amount: 10000
              }
            ],
            notes: 'Payment due within 30 days',
            referenceNumber: 'PO-2024-001'
          },
          {
            _id: '507f1f77bcf86cd799439016',
            invoiceNumber: 'INV-2024-002',
            clientId: '507f1f77bcf86cd799439013',
            clientName: 'XYZ Enterprises',
            clientState: 'Karnataka',
            issueDate: '2024-01-20',
            dueDate: '2024-02-20',
            status: 'draft',
            subtotal: 15000,
            gstAmount: 2700,
            total: 17700,
            lineItems: [
              {
                description: 'Mobile App Development',
                quantity: 1,
                unitPrice: 15000,
                taxRate: 18,
                amount: 15000
              }
            ],
            notes: 'Draft invoice for review',
            referenceNumber: 'PO-2024-002'
          }
        ]
      });
    }, 500);
  });
};

// Description: Get invoice by ID
// Endpoint: GET /api/invoices/:id
// Request: {}
// Response: { invoice: object }
export const getInvoiceById = (id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        invoice: {
          _id: id,
          invoiceNumber: 'INV-2024-001',
          clientId: '507f1f77bcf86cd799439012',
          clientName: 'ABC Industries',
          clientState: 'Delhi',
          issueDate: '2024-01-15',
          dueDate: '2024-02-15',
          status: 'finalized',
          subtotal: 10000,
          gstAmount: 1800,
          total: 11800,
          lineItems: [
            {
              description: 'Web Development Services',
              quantity: 1,
              unitPrice: 10000,
              taxRate: 18,
              amount: 10000
            }
          ],
          notes: 'Payment due within 30 days',
          referenceNumber: 'PO-2024-001'
        }
      });
    }, 500);
  });
};

// Description: Create a new invoice
// Endpoint: POST /api/invoices
// Request: { clientId: string, issueDate: string, dueDate: string, lineItems: Array<object>, notes?: string, referenceNumber?: string }
// Response: { success: boolean, message: string, invoice: object }
export const createInvoice = (data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Invoice created successfully',
        invoice: { _id: '507f1f77bcf86cd799439017', invoiceNumber: 'INV-2024-003', ...data }
      });
    }, 500);
  });
};

// Description: Update an invoice
// Endpoint: PUT /api/invoices/:id
// Request: { clientId: string, issueDate: string, dueDate: string, lineItems: Array<object>, notes?: string, referenceNumber?: string }
// Response: { success: boolean, message: string }
export const updateInvoice = (id: string, data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Invoice updated successfully' });
    }, 500);
  });
};

// Description: Delete an invoice
// Endpoint: DELETE /api/invoices/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteInvoice = (id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Invoice deleted successfully' });
    }, 500);
  });
};

// Description: Finalize an invoice
// Endpoint: POST /api/invoices/:id/finalize
// Request: {}
// Response: { success: boolean, message: string }
export const finalizeInvoice = (id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Invoice finalized successfully' });
    }, 500);
  });
};

// Description: Send invoice via email
// Endpoint: POST /api/invoices/:id/send
// Request: { to: string, subject: string, message: string }
// Response: { success: boolean, message: string }
export const sendInvoice = (id: string, data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Invoice sent successfully' });
    }, 500);
  });
};