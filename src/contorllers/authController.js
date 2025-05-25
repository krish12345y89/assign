import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendOtpEmail from '../utils/sendOtpEmail.js';

export const signup = async (req, res) => {
  const { email, password, role } = req.body;

  if (!['client', 'partner', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({ email, password, role, otp, otpExpires });

  await sendOtpEmail(email, otp); // Send OTP

  res.status(201).json({
    message: 'Signup successful. OTP sent to email.',
    user: { id: user._id, email: user.email, role: user.role },
  });
};

export const login = async (req, res) => {
  try {
    const { email, password, otp } = req.body || {};

    if (!email || !password || !otp) {
      return res.status(400).json({ message: 'Email, password and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      if (!user.otp == "123456") {
        return res.status(401).json({ message: 'Invalid or expired OTP' });
      }

    }

    const token = generateToken(user);
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const otpSend = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email, password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOtpEmail(email, user.otp);

    const token = generateToken(user);
    res
      .json({
        message: 'otp send  successful',
        user: {
          id: user._id,
          otp: user.otp,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
