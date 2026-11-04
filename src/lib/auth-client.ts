import {
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ResendOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  AuthResponse,
  AuthUser
} from '../shared/auth';
import { SubscriptionPlan } from '../shared/plans';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  const local = localStorage.getItem('sloot_token') || localStorage.getItem('auth_token');
  if (local) return local;
  const match = document.cookie.match(/(?:^|;\s*)(?:sloot_token|token)=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  return null;
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sloot_token', token);
  // Set cookie for middleware access (with Secure attribute on HTTPS)
  const isSecure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `sloot_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax${isSecure}`;
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sloot_token');
  localStorage.removeItem('auth_token');
  const isSecure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `sloot_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${isSecure}`;
}

import { apiCache } from './api-cache';

export interface RequestOptions extends RequestInit {
  bypassCache?: boolean;
  ttlMs?: number;
}

export function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'undefined' && value !== 'null') {
      searchParams.set(key, String(value));
    }
  }
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

async function performFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as Error & { code?: string; status: number; details?: any };
    err.code = data?.error?.code;
    err.status = response.status;
    err.details = data?.error?.details;
    throw err;
  }

  return (data?.data ?? data) as T;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();

  // If GET request, route through in-memory cache and deduplication
  if (method === 'GET') {
    const token = getStoredToken();
    const cacheKey = `${token ? 'auth:' : 'pub:'}${endpoint}`;
    return apiCache.dedupe(
      cacheKey,
      () => performFetch<T>(endpoint, options),
      { ttlMs: options.ttlMs, bypassCache: options.bypassCache }
    );
  }

  // Mutating requests invalidate matching cache keys immediately
  const result = await performFetch<T>(endpoint, options);
  // Invalidate all client-side cached queries immediately on ANY mutation
  apiCache.clear();
  return result;
}

export interface PurchaseOrderResult {
  orderId: string;
  paymentId: string;
  planId: string;
  planName: string;
  priceUsd: number;
  priceCents: number;
  status: string;
  checkoutUrl: string;
  createdAt: string;
}

export interface OrderDetails {
  orderId: string;
  paymentId: string;
  planId: string;
  planName: string;
  priceUsd: number;
  priceCents: number;
  duration: { unit: 'DAYS' | 'MONTHS'; value: number };
  durationDays: number;
  status: string;
  checkoutUrl?: string;
  createdAt: string;
}

export const authClient = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async verifyOtp(input: VerifyOtpInput): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async resendOtp(input: ResendOtpInput): Promise<{ success: boolean; cooldownSeconds: number }> {
    return request<{ success: boolean; cooldownSeconds: number }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async resetPassword(input: ResetPasswordInput): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async changePassword(input: ChangePasswordInput): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async getMe(): Promise<AuthUser> {
    const res = await request<any>('/auth/me');
    return res?.user || res;
  },

  async updateProfile(input: { name?: string; phone?: string }): Promise<AuthUser> {
    const res = await request<any>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(input)
    });
    return res?.user || res;
  },

  async getMySubscription(): Promise<{ active: any; history: any[] }> {
    return request<{ active: any; history: any[] }>('/subscriptions/my-subscription');
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore network errors on logout
    } finally {
      clearStoredToken();
    }
  },

  // Plan Management & Purchase Flow
  async getPlans(): Promise<SubscriptionPlan[]> {
    return request<SubscriptionPlan[]>('/subscriptions/plans');
  },

  async createPurchaseOrder(planId: string, payCurrency = 'USDTTRC20'): Promise<PurchaseOrderResult> {
    return request<PurchaseOrderResult>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ planId, payCurrency })
    });
  },

  async getOrder(orderId: string): Promise<OrderDetails> {
    return request<OrderDetails>(`/payments/order/${orderId}`);
  },

  // Contact Inquiries
  async submitContact(input: { name: string; email: string; subject: string; message: string }): Promise<{ message: string }> {
    return request<{ message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  // Authoritative Server-Side Subscription Access Verification
  async getAccessStatus(): Promise<import('../shared/subscriptions').AccessStatusResponse> {
    return request<import('../shared/subscriptions').AccessStatusResponse>('/subscriptions/access-status');
  },

  // Secret Code Tool Unlock
  async unlockToolWithSecretCode(secretCode: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/subscriptions/unlock-tool', {
      method: 'POST',
      body: JSON.stringify({ secretCode })
    });
  },

  // Admin Subscription Management
  async grantManualSubscription(input: import('../shared/subscriptions').GrantManualSubscriptionInput): Promise<any> {
    return request('/subscriptions/admin/grant', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async extendSubscription(input: import('../shared/subscriptions').ExtendSubscriptionInput): Promise<any> {
    return request('/subscriptions/admin/extend', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async revokeSubscription(input: import('../shared/subscriptions').RevokeSubscriptionInput): Promise<any> {
    return request('/subscriptions/admin/revoke', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async approveAdminSubscription(subscriptionId: string): Promise<any> {
    return request(`/subscriptions/admin/${subscriptionId}/approve`, {
      method: 'POST'
    });
  },

  async manualUnlockAdminSubscription(subscriptionId: string): Promise<any> {
    return request(`/subscriptions/admin/${subscriptionId}/manual-unlock`, {
      method: 'POST'
    });
  },

  async listAllSubscriptions(): Promise<any[]> {
    return request<any[]>('/subscriptions/admin/list');
  },

  // Payment Currencies & Admin Orders
  async getPaymentCurrencies(): Promise<string[]> {
    return request<string[]>('/payments/currencies');
  },

  async getAdminPaymentOrders(params?: Record<string, any>): Promise<any> {
    const qs = buildQueryString(params);
    return request<any>(`/payments/admin/orders${qs}`);
  },

  async getAdminPaymentSummary(): Promise<import('../shared/subscriptions').AdminPaymentSummary> {
    return request<import('../shared/subscriptions').AdminPaymentSummary>('/payments/admin/summary');
  },

  async exportAdminPayments(startDate?: string, endDate?: string): Promise<{ csv: string; count: number; totalGrossUsd: number }> {
    const query = new URLSearchParams();
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);
    return request<{ csv: string; count: number; totalGrossUsd: number }>(`/payments/admin/export?${query.toString()}`);
  },

  // Main Admin Management
  clearCache(): void {
    apiCache.clear();
  },

  async getAdminDashboardMetrics(bypassCache?: boolean): Promise<any> {
    return request<any>('/admin/dashboard-metrics', { bypassCache });
  },

  async getAdminUsers(params?: Record<string, any>, bypassCache?: boolean): Promise<any> {
    const qs = buildQueryString(params);
    return request<any>(`/admin/users${qs}`, { bypassCache });
  },

  async getAdminUserDetails(userId: string): Promise<any> {
    return request<any>(`/admin/users/${userId}`);
  },

  async updateAdminUserProfile(userId: string, data: any): Promise<any> {
    return request<any>(`/admin/users/${userId}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async changeAdminUserStatus(userId: string, data: { action: 'BLOCK' | 'UNBLOCK' | 'SUSPEND'; reason: string; suspendedUntil?: string }): Promise<any> {
    return request<any>(`/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminUser(userId: string, reason: string): Promise<any> {
    return request<any>(`/admin/users/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    });
  },

  async getAdminAuditLogs(params?: Record<string, any>): Promise<any> {
    const qs = buildQueryString(params);
    return request<any>(`/admin/audit-logs${qs}`);
  },

  async getAdminDualApprovals(status?: string): Promise<any[]> {
    const qs = status ? `?status=${status}` : '';
    return request<any[]>(`/admin/dual-approvals${qs}`);
  },

  async requestAdminDualApproval(data: any): Promise<any> {
    return request<any>('/admin/dual-approvals/request', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async approveAdminDualApproval(requestId: string): Promise<any> {
    return request<any>(`/admin/dual-approvals/${requestId}/approve`, {
      method: 'POST'
    });
  },

  async rejectAdminDualApproval(requestId: string, reason: string): Promise<any> {
    return request<any>(`/admin/dual-approvals/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  async getAdminSubscriptions(params?: Record<string, any>): Promise<any> {
    const qs = buildQueryString(params);
    return request<any>(`/subscriptions/admin/list${qs}`);
  },

  async grantAdminManualSubscription(data: { targetEmail: string; planId: string; reason: string }): Promise<any> {
    return request<any>('/subscriptions/admin/grant', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async extendAdminSubscription(data: { subscriptionId: string; extensionValue: number; extensionUnit: string; reason: string }): Promise<any> {
    return request<any>('/subscriptions/admin/extend', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async revokeAdminSubscription(data: { subscriptionId: string; reason: string }): Promise<any> {
    return request<any>('/subscriptions/admin/revoke', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getAdminOrders(params?: Record<string, any>): Promise<any> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/payments/admin/orders${qs}`);
  },

  async getAdminOrdersSummary(): Promise<any> {
    return request<any>('/payments/admin/summary');
  },

  async getAdminPlans(): Promise<any[]> {
    return request<any[]>('/admin/plans');
  },

  async createAdminPlan(data: any): Promise<any> {
    return request<any>('/admin/plans', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminPlan(planId: string, data: any): Promise<any> {
    return request<any>(`/admin/plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminPlan(planId: string): Promise<any> {
    return request<any>(`/admin/plans/${planId}`, {
      method: 'DELETE'
    });
  },

  // --- Moderator Management (Main Admin) ---
  async getAdminModerators(params?: Record<string, any>): Promise<any> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/admin/moderators${qs}`);
  },

  async getAdminModeratorDetails(moderatorId: string): Promise<any> {
    return request<any>(`/admin/moderators/${moderatorId}`);
  },

  async createAdminStaffUser(data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: 'SUPER_ADMIN' | 'MODERATOR';
    commissionRate?: number;
    notes?: string;
    reason?: string;
  }): Promise<any> {
    return request<any>('/admin/users/create-staff', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async createAdminModerator(data: { name: string; email: string; phone?: string; password: string; commissionRate?: number; notes?: string }): Promise<any> {
    return request<any>('/admin/moderators', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminModeratorStatus(moderatorId: string, data: { status: string; reason: string; suspendedUntil?: string }): Promise<any> {
    return request<any>(`/admin/moderators/${moderatorId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async resetAdminModeratorPassword(moderatorId: string, data: { newPassword?: string; reason: string }): Promise<any> {
    return request<any>(`/admin/moderators/${moderatorId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminModeratorCommissionRate(moderatorId: string, data: { commissionRate: number; reason: string }): Promise<any> {
    return request<any>(`/admin/moderators/${moderatorId}/commission-rate`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // --- Referral & Commission Telemetry (Main Admin) ---
  async getAdminReferralOverview(): Promise<any> {
    return request<any>('/admin/referrals/overview');
  },

  async getAdminCommissions(params?: Record<string, any>): Promise<any> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/admin/referrals/commissions${qs}`);
  },

  async updateAdminCommissionStatus(commissionId: string, data: { status: string; reason: string }): Promise<any> {
    return request<any>(`/admin/referrals/commissions/${commissionId}/status`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getAdminCommissionPolicy(): Promise<any> {
    return request<any>('/admin/referrals/policy');
  },

  async updateAdminCommissionPolicy(data: { defaultRate: number; reason: string }): Promise<any> {
    return request<any>('/admin/referrals/policy', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getAdminReferralFraudAlerts(): Promise<any[]> {
    return request<any[]>('/admin/referrals/fraud-alerts');
  },

  // --- Moderator Self Dashboard ---
  async getModeratorSelfDashboard(): Promise<any> {
    return request<any>('/moderator/dashboard');
  },

  async getModeratorSelfCommissions(params?: Record<string, any>): Promise<any> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/moderator/commissions${qs}`);
  },

  async getModeratorSelfReferredUsers(params?: Record<string, any>): Promise<any> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/moderator/referred-users${qs}`);
  },

  // --- Phase 8: Tool Management & Operational Status ---
  async getPublicToolStatus(): Promise<any> {
    return request<any>('/tool/status');
  },

  async getAdminToolSettings(): Promise<any> {
    return request<any>('/admin/tool/settings');
  },

  async updateAdminToolSettings(updates: any, reason?: string): Promise<any> {
    return request<any>('/admin/tool/settings', {
      method: 'PATCH',
      body: JSON.stringify({ ...updates, reason: reason || updates.reason || 'Admin tool settings update' })
    });
  },

  // --- Phase 8: Website CMS & Settings ---
  async getPublicWebsiteSettings(): Promise<any> {
    return request<any>('/settings/public');
  },

  async getAdminWebsiteSettings(): Promise<any> {
    return request<any>('/admin/settings');
  },

  async updateAdminWebsiteSettings(settings: any, reason?: string): Promise<any> {
    return request<any>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings, reason: reason || settings.reason || 'Admin website settings update' })
    });
  },

  // --- Phase 8: Platform Reports & Analytics ---
  async getReportsSummary(filters?: Record<string, any>): Promise<any> {
    const qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request<any>(`/admin/reports/summary${qs}`);
  },

  getReportExportUrl(reportType: string, filters?: Record<string, any>): string {
    const params = new URLSearchParams({ reportType, ...(filters || {}) });
    return `${API_BASE}/admin/reports/export?${params.toString()}`;
  },

  // --- Phase 8: In-App Notifications ---
  async getUserNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<any> {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any>(`/notifications${qs}`);
  },

  async markNotificationAsRead(id: string): Promise<any> {
    return request<any>(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  },

  async markAllNotificationsAsRead(): Promise<any> {
    return request<any>('/notifications/read-all', {
      method: 'POST'
    });
  },

  async broadcastAnnouncement(
    titleOrData: string | { title: string; message: string; targetRole?: string },
    message?: string,
    targetRole?: string
  ): Promise<any> {
    const payload = typeof titleOrData === 'object'
      ? titleOrData
      : { title: titleOrData, message, targetRole };
    return request<any>('/admin/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // --- Extended Admin: Support Tickets ---
  async getAdminTickets(params?: Record<string, any>): Promise<any> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/admin/tickets${qs}`);
  },

  async getAdminTicketDetails(ticketId: string): Promise<any> {
    return request<any>(`/admin/tickets/${ticketId}`);
  },

  async replyAdminTicket(ticketId: string, data: { message: string; isInternalNote?: boolean }): Promise<any> {
    return request<any>(`/admin/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminTicketStatus(ticketId: string, data: { status: string; reason?: string }): Promise<any> {
    return request<any>(`/admin/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async assignAdminTicket(ticketId: string, adminId: string): Promise<any> {
    return request<any>(`/admin/tickets/${ticketId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ adminId })
    });
  },

  // --- Extended Admin: Security Operations Center ---
  async getAdminSecurityOverview(): Promise<any> {
    return request<any>('/admin/security/overview');
  },

  async getAdminSecurityAlerts(): Promise<any[]> {
    return request<any[]>('/admin/security/alerts');
  },

  async revokeAdminUserSessions(userId: string, reason: string): Promise<any> {
    return request<any>(`/admin/security/revoke-sessions/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // --- Extended Admin: Roulette Tool Telemetry ---
  async getAdminToolTelemetry(): Promise<any> {
    return request<any>('/admin/tool/telemetry');
  },

  // --- Extended Admin: AI Admin Assistant ---
  async queryAdminAiAssistant(query: string): Promise<any> {
    return request<any>('/admin/ai-assistant/query', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  },

  // --- Extended Admin: Notification Management ---
  async getAdminNotificationMetrics(): Promise<any> {
    return request<any>('/admin/notifications/metrics');
  },

  async sendAdminTargetedNotification(data: { title: string; message: string; targetType: string; targetUserId?: string; link?: string }): Promise<any> {
    return request<any>('/admin/notifications/targeted', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getStoredToken(): string | null {
    return getStoredToken();
  }
};
