import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: 'Username or email is required' })
      .min(2, 'Must be at least 2 characters')
      .max(500),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password cannot be empty'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({ required_error: 'Refresh token is required' })
      .min(1, 'Refresh token cannot be empty'),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'New password must be different from current password',
      path: ['newPassword'],
    }),
});

const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const SECURITY_QUESTIONS = [
  'What city were you born in?',
  'What was the name of your first pet?',
  'What was the make of your first car?',
  'What is your favorite food?',
  'What elementary school did you attend?',
  'What is the name of your childhood best friend?',
  'What was the name of your first boss?',
  'What is your favorite movie?',
];

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, 'Full name is required').max(200),
    email: z.string().email('Invalid email address'),
    password: passwordRule,
    securityQuestion: z
      .string()
      .refine((val) => SECURITY_QUESTIONS.includes(val), 'Invalid security question'),
    securityAnswer: z.string().min(1, 'Security answer is required').max(200),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: passwordRule,
  }),
});

export const verifySecurityAnswerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    answer: z.string().min(1, 'Answer is required'),
  }),
});
