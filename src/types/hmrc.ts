export interface HMRCConnection {
  id: string;
  user_id: string;
  connection_status: 'active' | 'expired' | 'disconnected' | 'pending';
  scopes: string[];
  metadata: any;
  hmrc_account_id: string;
  expires_at: string;
  last_activity_at: string;
  connected_at: string;
  created_at: string;
  updated_at: string;
}

export interface HMRCToken {
  id: string;
  user_id: string;
  connection_id: string;
  expires_at: string;
  token_type: string;
  scope: string;
  created_at: string;
  updated_at: string;
}

export interface HMRCDataSync {
  id: string;
  user_id: string;
  connection_id: string;
  data_type: 'self_assessment' | 'vat_return' | 'obligations' | 'payment_history' | 'income';
  sync_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  records_synced?: number;
  error_message?: string;
  error_details?: any;
  last_sync_at?: string;
  next_sync_at?: string;
  created_at: string;
}

export interface HMRCTaxData {
  id: string;
  user_id: string;
  connection_id: string;
  data_type: string;
  tax_year: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SelfAssessmentData {
  utr?: string;
  taxYear?: string;
  totalIncome?: number;
  totalDeductions?: number;
  taxDue?: number;
  paymentStatus?: string;
}
