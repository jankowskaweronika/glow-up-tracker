import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is required in .env');
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

const EMAIL = process.argv[2] || 'admin@glowup.pl';
const PASSWORD = process.argv[3] || 'glowup2024';

const existing = await User.findOne({ email: EMAIL });
if (existing) {
  console.log(`Użytkownik ${EMAIL} już istnieje.`);
} else {
  const hashed = bcrypt.hashSync(PASSWORD, 10);
  await User.create({ email: EMAIL, password: hashed });
  console.log(`Utworzono konto: ${EMAIL} / ${PASSWORD}`);
}

await mongoose.disconnect();
