import express from 'express';
import {
  createInvoice,
  recordPayment,
  getInvoices,
  getFlaggedInvoices,
} from '../controllers/invoiceController.js';

const router = express.Router();

router.post('/', createInvoice);
router.patch('/:id/payment', recordPayment);
router.get('/', getInvoices);
router.get('/flagged', getFlaggedInvoices);

export default router;
