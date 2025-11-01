import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'patient-service' });
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Patient Service is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Patient Service running on port ${PORT}`);
});
