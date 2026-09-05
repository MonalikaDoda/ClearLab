import axios from 'axios';

const api = axios.create({ baseURL: 'https://clearlab.onrender.com/api', headers: { 'Content-Type': 'application/json' } });

export const createPatient = async (patient) => (await api.post('/patients', patient)).data;
export const getPatients = async () => (await api.get('/patients')).data;
export const createService = async (service) => (await api.post('/services', service)).data;
export const getServices = async () => (await api.get('/services')).data;
export const createInvoice = async (invoice) => (await api.post('/invoices', invoice)).data;
export const recordPayment = async (invoiceId, amount) => (await api.patch(`/invoices/${invoiceId}/payment`, { amount })).data;
export const getInvoices = async () => (await api.get('/invoices')).data;
export const getFlaggedInvoices = async () => (await api.get('/invoices/flagged')).data;
export const generateReminder = async (invoiceId) => (await api.post(`/invoices/${invoiceId}/reminder`)).data;
