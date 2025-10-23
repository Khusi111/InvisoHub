import api from './api';

// Description: Get company profile
// Endpoint: GET /api/companies/profile
// Request: {}
// Response: { company: { _id: string, name: string, code: string, email: string, phone: string, address: string, city: string, state: string, pincode: string, gstin: string, logo?: string, bankDetails: { accountName: string, accountNumber: string, ifsc: string, bankName: string } } }
export const getCompanyProfile = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        company: {
          _id: '507f1f77bcf86cd799439011',
          name: 'TechCorp Solutions',
          code: 'TECH001',
          email: 'admin@techcorp.com',
          phone: '+91 9876543210',
          address: '123 Business Park',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          gstin: '27ABCDE1234F1Z5',
          logo: 'https://via.placeholder.com/150x60/4F46E5/FFFFFF?text=TechCorp',
          bankDetails: {
            accountName: 'TechCorp Solutions',
            accountNumber: '1234567890',
            ifsc: 'HDFC0001234',
            bankName: 'HDFC Bank'
          }
        }
      });
    }, 500);
  });
};

// Description: Update company profile
// Endpoint: PUT /api/companies/profile
// Request: { name: string, email: string, phone: string, address: string, city: string, state: string, pincode: string, gstin: string, logo?: string, bankDetails: object }
// Response: { success: boolean, message: string }
export const updateCompanyProfile = (data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Company profile updated successfully' });
    }, 500);
  });
};