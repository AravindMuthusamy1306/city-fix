import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import issueRoutes from './routes/issues.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/issues', issueRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));