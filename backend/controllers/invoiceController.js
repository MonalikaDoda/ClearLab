import Invoice from '../models/Invoice.js';
import Service from '../models/Service.js';
import { generateReminderMessage } from '../services/aiService.js';

export const createInvoice = async (req, res) => {
  try {
    const { patientId, serviceIds } = req.body;

    const servicesData = await Promise.all(
      serviceIds.map(async (serviceId) => {
        const service = await Service.findById(serviceId);

        if (!service) {
          throw new Error(`Service not found: ${serviceId}`);
        }

        return {
          serviceId: service._id,
          name: service.name,
          price: service.price,
        };
      })
    );

    const totalAmount = servicesData.reduce((sum, service) => sum + service.price, 0);

    const invoice = new Invoice({
      patientId,
      services: servicesData,
      totalAmount,
      amountPaid: 0,
      status: 'unpaid',
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    // Prevent overpayment
    const newAmountPaid = Number(invoice.amountPaid) + Number(amount);
    if (newAmountPaid > Number(invoice.totalAmount) || Number(invoice.amountPaid) === Number(invoice.totalAmount)) {
      const remainingBalance = Number(invoice.totalAmount) - Number(invoice.amountPaid);
      return res.status(400).json({ message: `Payment exceeds amount due — remaining balance is ₹${remainingBalance.toFixed(2)}.` });
    }

    invoice.amountPaid = newAmountPaid;

    if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.status = 'paid';
      invoice.flaggedForReview = false;
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'partial';
      invoice.flaggedForReview = true;
    } else {
      invoice.status = 'unpaid';
      invoice.flaggedForReview = false;
    }

    await invoice.save();
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('patientId');
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFlaggedInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ flaggedForReview: true }).populate('patientId');
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate('patientId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const patientName = invoice.patientId?.name || 'Patient';
    const nextReminderCount = (Number(invoice.reminderCount) || 0) + 1;

    const reminder = await generateReminderMessage({
      patientName,
      totalAmount: invoice.totalAmount,
      amountPaid: invoice.amountPaid,
      reminderCount: nextReminderCount,
    });

    if (reminder?.error || !reminder?.message) {
      return res.status(503).json({ message: reminder?.message || 'The AI service is temporarily unavailable. Please try again in a moment.' });
    }

    invoice.reminderCount = nextReminderCount;
    invoice.reminderDraft = reminder.message;
    await invoice.save();

    return res.status(200).json({
      message: invoice.reminderDraft,
      reminderCount: invoice.reminderCount,
      generatedBy: reminder.generatedBy || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
