// Base types
export interface BaseEntity {
  id: string;
  public_id: string;
  created_at: string;
  updated_at?: string;
}

// User types
export interface User extends BaseEntity {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  is_active: boolean;
  last_login?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'es' | 'en';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

// Currency types
export interface Currency extends BaseEntity {
  code: string;
  name: string;
  decimals: number;
  symbol?: string;
}

// Process status types
export interface ProcessStatus extends BaseEntity {
  code: string;
  description: string;
  color?: string;
  icon?: string;
}

// Bank/Provider types
export interface Bank extends BaseEntity {
  code: string;
  name: string;
  provider_type: 'gateway' | 'network' | 'bank';
  status: 'ACTIVE' | 'INACTIVE';
  logo_url?: string;
  supported_currencies?: string[];
}

// Debtor types
export interface Debtor extends BaseEntity {
  name: string;
  document_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  status: 'sin_pagos' | 'al_dia' | 'pago_parcial' | 'vencido' | 'error';
  notes?: string;
  full_name?: string;
  property_id?: string;
  property_name?: string;
  monthly_rent?: number;
  last_payment?: string;
  debt_amount?: number;
}

export interface DebtorCreate {
  name: string;
  document_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
}

export interface DebtorUpdate extends Partial<DebtorCreate> {}

// Unit types
export interface Unit extends BaseEntity {
  floor: string;
  unit_type: 'apartment' | 'office' | 'house' | 'room';
  label: string;
  description?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  monthly_rent?: number;
  currency_id?: string;
  images?: string[];
}

export interface UnitCreate {
  floor: string;
  unit_type: 'apartment' | 'office' | 'house' | 'room';
  label: string;
  description?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  monthly_rent?: number;
  currency_id?: string;
}

export interface UnitUpdate extends Partial<UnitCreate> {}

// Lease types
export interface Lease extends BaseEntity {
  debtor_id: string;
  unit_id: string;
  start_date: string;
  end_date?: string;
  rent_amount: number;
  currency_id: string;
  guarantee: boolean;
  guarantee_amount?: number;
  deposit_amount?: number;
  utilities_included: boolean;
  utilities_amount?: number;
  late_fee_percentage?: number;
  grace_period_days?: number;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  terms?: string;
  attachments?: string[];
  
  // Relations
  debtor?: Debtor;
  unit?: Unit;
  currency?: Currency;
}

export interface LeaseCreate {
  debtor_id: string;
  unit_id: string;
  start_date: string;
  end_date?: string;
  rent_amount: number;
  currency_id: string;
  guarantee: boolean;
  guarantee_amount?: number;
  deposit_amount?: number;
  utilities_included: boolean;
  utilities_amount?: number;
  late_fee_percentage?: number;
  grace_period_days?: number;
  terms?: string;
}

export interface LeaseUpdate extends Partial<LeaseCreate> {}

// Payment types
export interface Payment extends BaseEntity {
  debtor_id: string;
  lease_id?: string;
  period: string; // YYYY-MM format
  due_date?: string;
  paid_at?: string;
  amount: number;
  currency_id: string;
  method?: 'cash' | 'transfer' | 'crypto' | 'check';
  reference?: string;
  status_id: string;
  meter_start?: number;
  meter_end?: number;
  notes?: string;
  s3_key?: string;
  bank_id?: string;
  invoice_id?: string;
  
  // Relations
  debtor?: Debtor;
  lease?: Lease;
  currency?: Currency;
  status?: ProcessStatus;
  bank?: Bank;
}

export interface PaymentCreate {
  debtor_id: string;
  lease_id?: string;
  period: string;
  due_date?: string;
  amount: number;
  currency_id: string;
  method?: 'cash' | 'transfer' | 'crypto' | 'check';
  reference?: string;
  meter_start?: number;
  meter_end?: number;
  notes?: string;
  bank_id?: string;
}

export interface PaymentUpdate extends Partial<PaymentCreate> {}

export interface PaymentConfirm {
  paid_at?: string;
  reference?: string;
}

export interface PaymentReceipt {
  format: 'png' | 'pdf';
  include_qr: boolean;
}

export interface PaymentDetail extends Payment {
  debtor_name: string;
  currency_code: string;
  status_code: string;
  status_description: string;
  bank_name?: string;
  pre_signed_url?: string;
}

// Crypto payment types
export interface CryptoCheckout {
  order_public_id: string;
  amount: number;
  currency_code: string;
  provider_code: string;
}

export interface CryptoCheckoutResponse {
  payment_url: string;
  invoice_id: string;
  status: string;
  expires_at: string;
}

// Webhook types
export interface WebhookPayload {
  id: string;
  status: string;
  price_amount: number;
  price_currency: string;
  receive_currency?: string;
  receive_amount?: number;
  order_id: string;
  payment_url?: string;
  created_at: string;
  updated_at: string;
}

// Report types
export interface PaymentReport {
  debtor_id?: string;
  from_date?: string;
  to_date?: string;
  status_codes?: string[];
  format: 'csv' | 'json';
}

export interface PaymentReportResponse {
  data: PaymentDetail[];
  total: number;
  summary: {
    total_amount: number;
    total_payments: number;
    pending_amount: number;
    paid_amount: number;
    overdue_amount: number;
  };
}

// Pagination types
export interface PaginationParams {
  page: number;
  size: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Filter types
export interface PaymentFilters {
  debtor_public_id?: string;
  status_code?: string;
  period?: string;
  from_date?: string;
  to_date?: string;
  method?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface DebtorFilters {
  status?: string;
  search?: string;
  has_active_lease?: boolean;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
}

export interface ProfileForm {
  name: string;
  phone?: string;
  avatar?: File;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'es' | 'en';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  detail: string | Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
  status_code: number;
}

// Dashboard types
export interface DashboardStats {
  total_debtors: number;
  active_leases: number;
  total_payments: number;
  pending_payments: number;
  overdue_payments: number;
  monthly_revenue: number;
  currency_code: string;
}

export interface DashboardChart {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
  }[];
}

export interface DashboardData {
  stats: DashboardStats;
  recent_payments: PaymentDetail[];
  upcoming_due_dates: PaymentDetail[];
  revenue_chart: DashboardChart;
  payments_chart: DashboardChart;
}

