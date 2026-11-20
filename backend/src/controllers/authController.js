import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const tokenFor = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const userPayload = user => ({ id: user._id, name: user.name, email: user.email });
export const signup = async (req, res, next) => {
  try {
    const exists = await User.findOne({ email: req.body.email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists' });
    const user = await User.create({ name: req.body.name, email: req.body.email, password: req.body.password });
    res.status(201).json({ token: tokenFor(user._id), user: userPayload(user) });
  } catch (e) { next(e); }
};
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(req.body.password))) return res.status(401).json({ message: 'Email or password is incorrect' });
    res.json({ token: tokenFor(user._id), user: userPayload(user) });
  } catch (e) { next(e); }
};
export const me = (req, res) => res.json({ user: userPayload(req.user) });
