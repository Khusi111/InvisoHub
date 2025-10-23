const API_BASE = '/api/accounts/clients/';

// Helper function to get headers with JWT token if present
function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// Map frontend form fields to backend model field names
function mapClientData(data: any) {
  return {
    name: data.name,
    contact_person: data.contactPerson,
    email: data.email,
    phone: data.phone,
    address: data.billingAddress, // Backend expects 'address'
    gstin: data.gstin,
    country: data.billingState || data.country, // Use billingState or country
  };
}

export async function getClients() {
  const response = await fetch(API_BASE, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch clients');
  const clients = await response.json();
  return { clients };
}

export async function createClient(data: any) {
  const mappedData = mapClientData(data);
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mappedData),
  });
  if (!response.ok) throw new Error('Failed to create client');
  const client = await response.json();
  return {
    success: true,
    message: 'Client created successfully',
    client,
  };
}

export async function updateClient(id: string, data: any) {
  const mappedData = mapClientData(data);
  const response = await fetch(`${API_BASE}${id}/`, {
    method: 'PUT', // or PATCH if partial update preferred
    headers: getAuthHeaders(),
    body: JSON.stringify(mappedData),
  });
  if (!response.ok) throw new Error('Failed to update client');
  return {
    success: true,
    message: 'Client updated successfully',
  };
}

export async function deleteClient(id: string) {
  const response = await fetch(`${API_BASE}${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete client');
  return {
    success: true,
    message: 'Client deleted successfully',
  };
}
