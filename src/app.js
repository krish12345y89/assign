import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bodyParser from 'body-parser';
import inquiryRoutes from './routes/InquiryRoutes.js';
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.get("/", (req, res) => { res.send("Pixisphere Backend Auth Running") });
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/partner', partnerRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/review', reviewRoutes);
app.get('/', (req, res) => {
  res.send('📸 Pixisphere Backend Auth Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
export default app;