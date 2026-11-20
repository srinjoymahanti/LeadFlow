import { body, validationResult } from 'express-validator';

export const validate = (rules) => [...rules, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Please check the submitted fields', errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })) });
  next();
}];
export const signupRules = validate([
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
]);
export const loginRules = validate([body('email').isEmail().withMessage('Enter a valid email'), body('password').notEmpty().withMessage('Password is required')]);
export const leadRules = validate([
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Enter a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone is required').isLength({ max: 25 }),
  body('company').trim().notEmpty().withMessage('Company is required').isLength({ max: 120 }),
  body('source').isIn(['Website', 'Referral', 'Social Media', 'Cold Call', 'Advertisement', 'Other']).withMessage('Select a valid source'),
  body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Lost']).withMessage('Select a valid status')
]);
