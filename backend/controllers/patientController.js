import Patient from '../models/Patient.js';

export const createPatient = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const patient = new Patient({ name, phone });
    await patient.save();

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
