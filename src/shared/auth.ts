import { z } from 'zod';
import { UserRole } from './roles';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').default('Member'),
  email: z.string().email('Invalid email address format').optional().or(z.literal('')),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  referralCode: z.string().optional()
}).refine(data => (data.email && data.email.trim() !== '') || (data.phone && data.phone.trim() !== ''), {
  message: 'Either a valid email address or phone number is required'
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  identifier: z.string().min(3, 'Email or phone number is required'),
  password: z.string().min(6, 'Password is required')
});

export type LoginInput = z.infer<typeof LoginSchema>;

export enum OtpPurpose {
  REGISTRATION = 'REGISTRATION',
  LOGIN = 'LOGIN',
  PASSWORD_RESET = 'PASSWORD_RESET'
}

export const VerifyOtpSchema = z.object({
  target: z.string().min(3, 'Target email or phone is required'),
  code: z.string().length(6, 'Verification code must be exactly 6 digits'),
  purpose: z.nativeEnum(OtpPurpose)
});

export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

export const ResendOtpSchema = z.object({
  target: z.string().min(3, 'Target email or phone is required'),
  purpose: z.nativeEnum(OtpPurpose)
});

export type ResendOtpInput = z.infer<typeof ResendOtpSchema>;

export const ForgotPasswordSchema = z.object({
  target: z.string().min(3, 'Email or phone number is required')
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  target: z.string().min(3, 'Target email or phone is required'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long')
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long')
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  referralCode?: string;
  hasActiveSubscription: boolean;
  subscriptionPlanId?: string;
  subscriptionExpiresAt?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  requiresVerification?: boolean;
  verificationTarget?: string;
  verificationPurpose?: OtpPurpose;
  devOtp?: string;
}
