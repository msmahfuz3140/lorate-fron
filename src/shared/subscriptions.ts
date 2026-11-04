import { z } from 'zod';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  REVOKED = 'REVOKED'
}

export enum PaymentStatus {
  WAITING = 'WAITING',
  CONFIRMING = 'CONFIRMING',
  CONFIRMED = 'CONFIRMED',
  SENDING = 'SENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  EXPIRED = 'EXPIRED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED'
}

export interface NowPaymentsIpnPayload {
  payment_id: number | string;
  payment_status: string;
  pay_address?: string;
  price_amount: number;
  price_currency: string;
  pay_amount?: number;
  actually_paid?: number;
  pay_currency?: string;
  order_id: string;
  order_description?: string;
  purchase_id?: string | number;
  outcome_amount?: number;
  outcome_currency?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface AdminPaymentFilterInput {
  search?: string;
  status?: PaymentStatus;
  planId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AdminPaymentSummary {
  totalGrossUsd: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  reviewRequiredOrders: number;
  grossSalesUsd?: number;
  confirmedCount?: number;
  pendingCount?: number;
  failedCount?: number;
  paymentFeesUsd?: number;
  outstandingCommissionLiabilitiesUsd?: number;
  netRevenueUsd?: number;
}

export const CreatePaymentSchema = z.object({
  planId: z.string().min(1, 'Subscription plan ID is required'),
  payCurrency: z.string().default('USDTTRC20')
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;

export interface SubscriptionDTO {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  paymentId?: string;
  secretCode?: string;
  isSecretCodeClaimed?: boolean;
  secretCodeClaimedAt?: string;
  isApprovedByAdmin?: boolean;
  approvedAt?: string;
  daysRemaining?: number;
  isManualGrant?: boolean;
  grantReason?: string;
  isRevoked?: boolean;
  revocationReason?: string;
  extensionReason?: string;
  createdAt: string;
}

export interface PaymentDTO {
  id: string;
  userId: string;
  planId: string;
  priceAmount: number;
  priceCurrency: string;
  payAmount?: number;
  payCurrency?: string;
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  payAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralCommissionDTO {
  id: string;
  moderatorId: string;
  referredUserId: string;
  subscriptionId: string;
  paymentId: string;
  amountUsd: number;
  commissionRate: number;
  status: 'PENDING' | 'CREDITED';
  createdAt: string;
}

export interface AccessStatusResponse {
  hasAccess: boolean;
  reason?: string;
  code?: 'ACCESS_GRANTED' | 'SUBSCRIPTION_REQUIRED' | 'SUBSCRIPTION_EXPIRED' | 'SUBSCRIPTION_REVOKED' | 'UNAUTHENTICATED' | 'TOOL_DISABLED' | 'TOOL_MAINTENANCE' | 'SECRET_CODE_REQUIRED';
  planId?: string;
  planName?: string;
  status?: SubscriptionStatus;
  startDate?: string;
  endDate?: string;
  expiresAtFormatted?: string;
  daysRemaining?: number;
  isRoleBypass?: boolean; // True for Main Admin & Moderator
  needsSecretCode?: boolean;
  isApproved?: boolean;
}

export const UnlockToolSchema = z.object({
  secretCode: z.string().min(3, 'Valid secret code is required')
});

export type UnlockToolInput = z.infer<typeof UnlockToolSchema>;

export const GrantManualSubscriptionSchema = z.object({
  targetEmail: z.string().email('Valid user email is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  reason: z.string().min(3, 'Detailed reason for manual grant is required')
});

export type GrantManualSubscriptionInput = z.infer<typeof GrantManualSubscriptionSchema>;

export const ExtendSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  extensionValue: z.number().int().min(1, 'Extension duration value must be positive integer'),
  extensionUnit: z.enum(['DAYS', 'MONTHS']),
  reason: z.string().min(3, 'Reason for extension is required')
});

export type ExtendSubscriptionInput = z.infer<typeof ExtendSubscriptionSchema>;

export const RevokeSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  reason: z.string().min(3, 'Reason for revocation is required')
});

export type RevokeSubscriptionInput = z.infer<typeof RevokeSubscriptionSchema>;
