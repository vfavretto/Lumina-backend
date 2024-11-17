import mongoose from 'mongoose';

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

export default User;