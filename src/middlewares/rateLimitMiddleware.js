import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// aggressive limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 5, 
  message: 'Too many authentication attempts. Please try again after 10 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
