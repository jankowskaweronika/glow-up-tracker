import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is required in .env');
  process.exit(1);
}

// MongoDB connection
await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

// Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const trackerDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  data: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const TrackerData = mongoose.model('TrackerData', trackerDataSchema);

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
  credentials: true,
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
}));

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Nie jesteś zalogowany' });
  }
  next();
}

// Routes
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email i hasło są wymagane' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
  }

  req.session.userId = user._id;
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

app.get('/api/session', (req, res) => {
  res.json({ authenticated: !!req.session.userId });
});

app.get('/api/data', requireAuth, async (req, res) => {
  const doc = await TrackerData.findOne({ userId: req.session.userId });
  res.json(doc?.data || null);
});

app.put('/api/data', requireAuth, async (req, res) => {
  await TrackerData.findOneAndUpdate(
    { userId: req.session.userId },
    { data: req.body, updatedAt: new Date() },
    { upsert: true },
  );
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { User, TrackerData };
