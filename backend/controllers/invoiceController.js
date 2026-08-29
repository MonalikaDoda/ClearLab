import Invoice from '../models/Invoice.js';
import Service from '../models/Service.js';

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

    invoice.amountPaid += Number(amount);

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
