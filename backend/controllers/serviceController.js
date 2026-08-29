import Service from '../models/Service.js';

export const createService = async (req, res) => {
  try {
    const { name, price } = req.body;

    const service = new Service({ name, price });
    await service.save();

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
