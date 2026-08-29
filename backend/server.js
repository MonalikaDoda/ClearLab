import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db.js';
import patientRoutes from './routes/patients.js';
import serviceRoutes from './routes/services.js';
import invoiceRoutes from './routes/invoices.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/patients', patientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/invoices', invoiceRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
