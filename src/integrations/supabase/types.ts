export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_name: string
          account_type: string
          balance: number | null
          created_at: string | null
          currency_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_type: string
          balance?: number | null
          created_at?: string | null
          currency_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_type?: string
          balance?: number | null
          created_at?: string | null
          currency_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          data: Json
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          data: Json
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          data?: Json
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      balance_sheet_items: {
        Row: {
          amount: number
          business_entity_id: string | null
          category: string
          created_at: string | null
          currency_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          item_name: string
          item_type: string
          updated_at: string | null
          user_id: string
          valuation_date: string
        }
        Insert: {
          amount: number
          business_entity_id?: string | null
          category: string
          created_at?: string | null
          currency_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          item_name: string
          item_type: string
          updated_at?: string | null
          user_id: string
          valuation_date?: string
        }
        Update: {
          amount?: number
          business_entity_id?: string | null
          category?: string
          created_at?: string | null
          currency_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          item_name?: string
          item_type?: string
          updated_at?: string | null
          user_id?: string
          valuation_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_sheet_items_business_entity_id_fkey"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balance_sheet_items_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_templates: {
        Row: {
          budget_period: string
          business_entity_id: string | null
          created_at: string | null
          expense_categories: Json | null
          id: string
          income_categories: Json | null
          is_default: boolean | null
          template_name: string
          template_type: string
          total_expenses: number | null
          total_income: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_period: string
          business_entity_id?: string | null
          created_at?: string | null
          expense_categories?: Json | null
          id?: string
          income_categories?: Json | null
          is_default?: boolean | null
          template_name: string
          template_type: string
          total_expenses?: number | null
          total_income?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_period?: string
          business_entity_id?: string | null
          created_at?: string | null
          expense_categories?: Json | null
          id?: string
          income_categories?: Json | null
          is_default?: boolean | null
          template_name?: string
          template_type?: string
          total_expenses?: number | null
          total_income?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_templates_business_entity_id_fkey"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          actual_spent: number | null
          budget_period: string
          categories: Json | null
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          start_date: string
          total_budget: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_spent?: number | null
          budget_period: string
          categories?: Json | null
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          start_date: string
          total_budget: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_spent?: number | null
          budget_period?: string
          categories?: Json | null
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string
          total_budget?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      business_entities: {
        Row: {
          address: Json | null
          created_at: string | null
          entity_type: string
          id: string
          name: string
          settings: Json | null
          tax_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          entity_type: string
          id?: string
          name: string
          settings?: Json | null
          tax_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          entity_type?: string
          id?: string
          name?: string
          settings?: Json | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cost_centers: {
        Row: {
          budget_allocation: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_allocation?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_allocation?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          exchange_rate: number | null
          id: string
          is_base: boolean | null
          name: string
          symbol: string
          updated_at: string | null
        }
        Insert: {
          code: string
          exchange_rate?: number | null
          id?: string
          is_base?: boolean | null
          name: string
          symbol: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          exchange_rate?: number | null
          id?: string
          is_base?: boolean | null
          name?: string
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          completed_at: string | null
          created_at: string
          deadline_date: string
          deadline_type: string
          description: string | null
          id: string
          notification_days: number[] | null
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deadline_date: string
          deadline_type: string
          description?: string | null
          id?: string
          notification_days?: number[] | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deadline_date?: string
          deadline_type?: string
          description?: string | null
          id?: string
          notification_days?: number[] | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          ai_confidence: number | null
          category: string | null
          created_at: string | null
          extracted_text: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          parent_document_id: string | null
          processed_at: string | null
          processing_status: string | null
          public_url: string | null
          storage_path: string
          tags: string[] | null
          updated_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          ai_confidence?: number | null
          category?: string | null
          created_at?: string | null
          extracted_text?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          parent_document_id?: string | null
          processed_at?: string | null
          processing_status?: string | null
          public_url?: string | null
          storage_path: string
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          ai_confidence?: number | null
          category?: string | null
          created_at?: string | null
          extracted_text?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          parent_document_id?: string | null
          processed_at?: string | null
          processing_status?: string | null
          public_url?: string | null
          storage_path?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_goals: {
        Row: {
          business_entity_id: string | null
          created_at: string | null
          currency_id: string | null
          current_amount: number | null
          description: string | null
          goal_name: string
          goal_type: string
          id: string
          is_achieved: boolean | null
          priority: string | null
          target_amount: number
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_entity_id?: string | null
          created_at?: string | null
          currency_id?: string | null
          current_amount?: number | null
          description?: string | null
          goal_name: string
          goal_type: string
          id?: string
          is_achieved?: boolean | null
          priority?: string | null
          target_amount: number
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_entity_id?: string | null
          created_at?: string | null
          currency_id?: string | null
          current_amount?: number | null
          description?: string | null
          goal_name?: string
          goal_type?: string
          id?: string
          is_achieved?: boolean | null
          priority?: string | null
          target_amount?: number
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_goals_business_entity_id_fkey"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_goals_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          priority: string
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          priority?: string
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: string
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          created_at: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          next_run_date: string
          template_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          next_run_date: string
          template_data: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          next_run_date?: string
          template_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      revenue_streams: {
        Row: {
          actual_amount: number | null
          business_entity_id: string | null
          created_at: string | null
          currency_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          period_end: string | null
          period_start: string | null
          stream_name: string
          stream_type: string
          target_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_amount?: number | null
          business_entity_id?: string | null
          created_at?: string | null
          currency_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          period_end?: string | null
          period_start?: string | null
          stream_name: string
          stream_type: string
          target_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_amount?: number | null
          business_entity_id?: string | null
          created_at?: string | null
          currency_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          period_end?: string | null
          period_start?: string | null
          stream_name?: string
          stream_type?: string
          target_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_streams_business_entity_id_fkey"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_streams_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_logs: {
        Row: {
          action_description: string
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_recurring: boolean | null
          priority: string
          recurring_pattern: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_recurring?: boolean | null
          priority?: string
          recurring_pattern?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_recurring?: boolean | null
          priority?: string
          recurring_pattern?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_calculations: {
        Row: {
          amount_owed: number | null
          business_entity_id: string | null
          calculated_at: string | null
          calculation_details: Json | null
          calculation_type: string
          created_at: string | null
          credits_applied: number | null
          gross_income: number | null
          id: string
          tax_liability: number | null
          tax_period_id: string
          taxable_income: number | null
          total_deductions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_owed?: number | null
          business_entity_id?: string | null
          calculated_at?: string | null
          calculation_details?: Json | null
          calculation_type: string
          created_at?: string | null
          credits_applied?: number | null
          gross_income?: number | null
          id?: string
          tax_liability?: number | null
          tax_period_id: string
          taxable_income?: number | null
          total_deductions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_owed?: number | null
          business_entity_id?: string | null
          calculated_at?: string | null
          calculation_details?: Json | null
          calculation_type?: string
          created_at?: string | null
          credits_applied?: number | null
          gross_income?: number | null
          id?: string
          tax_liability?: number | null
          tax_period_id?: string
          taxable_income?: number | null
          total_deductions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tax_calculations_business_entity"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tax_calculations_tax_period"
            columns: ["tax_period_id"]
            isOneToOne: false
            referencedRelation: "tax_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_deductions: {
        Row: {
          amount: number
          business_entity_id: string | null
          category: string
          created_at: string | null
          currency_id: string | null
          deduction_type: string
          description: string
          id: string
          is_approved: boolean | null
          notes: string | null
          subcategory: string | null
          supporting_documents: Json | null
          tax_period_id: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          business_entity_id?: string | null
          category: string
          created_at?: string | null
          currency_id?: string | null
          deduction_type: string
          description: string
          id?: string
          is_approved?: boolean | null
          notes?: string | null
          subcategory?: string | null
          supporting_documents?: Json | null
          tax_period_id: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          business_entity_id?: string | null
          category?: string
          created_at?: string | null
          currency_id?: string | null
          deduction_type?: string
          description?: string
          id?: string
          is_approved?: boolean | null
          notes?: string | null
          subcategory?: string | null
          supporting_documents?: Json | null
          tax_period_id?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tax_deductions_business_entity"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tax_deductions_currency"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tax_deductions_tax_period"
            columns: ["tax_period_id"]
            isOneToOne: false
            referencedRelation: "tax_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tax_deductions_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_documents: {
        Row: {
          business_entity_id: string | null
          created_at: string | null
          deduction_id: string | null
          document_id: string
          document_type: string
          id: string
          tax_period_id: string | null
          tax_purpose: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_entity_id?: string | null
          created_at?: string | null
          deduction_id?: string | null
          document_id: string
          document_type: string
          id?: string
          tax_period_id?: string | null
          tax_purpose: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_entity_id?: string | null
          created_at?: string | null
          deduction_id?: string | null
          document_id?: string
          document_type?: string
          id?: string
          tax_period_id?: string | null
          tax_purpose?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tax_documents_business_entity"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tax_documents_deduction"
            columns: ["deduction_id"]
            isOneToOne: false
            referencedRelation: "tax_deductions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tax_documents_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tax_documents_tax_period"
            columns: ["tax_period_id"]
            isOneToOne: false
            referencedRelation: "tax_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_forms: {
        Row: {
          business_entity_id: string | null
          confirmation_number: string | null
          created_at: string | null
          due_date: string | null
          filed_date: string | null
          form_data: Json | null
          form_name: string
          form_type: string
          id: string
          status: string
          tax_period_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_entity_id?: string | null
          confirmation_number?: string | null
          created_at?: string | null
          due_date?: string | null
          filed_date?: string | null
          form_data?: Json | null
          form_name: string
          form_type: string
          id?: string
          status?: string
          tax_period_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_entity_id?: string | null
          confirmation_number?: string | null
          created_at?: string | null
          due_date?: string | null
          filed_date?: string | null
          form_data?: Json | null
          form_name?: string
          form_type?: string
          id?: string
          status?: string
          tax_period_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tax_forms_business_entity"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tax_forms_tax_period"
            columns: ["tax_period_id"]
            isOneToOne: false
            referencedRelation: "tax_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_payments: {
        Row: {
          amount: number
          business_entity_id: string | null
          confirmation_number: string | null
          created_at: string | null
          currency_id: string | null
          due_date: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          payment_type: string
          status: string
          tax_period_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          business_entity_id?: string | null
          confirmation_number?: string | null
          created_at?: string | null
          currency_id?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          payment_type: string
          status?: string
          tax_period_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          business_entity_id?: string | null
          confirmation_number?: string | null
          created_at?: string | null
          currency_id?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          payment_type?: string
          status?: string
          tax_period_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tax_payments_business_entity"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tax_payments_currency"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tax_payments_tax_period"
            columns: ["tax_period_id"]
            isOneToOne: false
            referencedRelation: "tax_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_periods: {
        Row: {
          actual_tax_due: number | null
          amount_paid: number | null
          business_entity_id: string | null
          created_at: string | null
          end_date: string
          estimated_tax_due: number | null
          id: string
          period_type: string
          quarter: number | null
          start_date: string
          status: string
          tax_year: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_tax_due?: number | null
          amount_paid?: number | null
          business_entity_id?: string | null
          created_at?: string | null
          end_date: string
          estimated_tax_due?: number | null
          id?: string
          period_type: string
          quarter?: number | null
          start_date: string
          status?: string
          tax_year: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_tax_due?: number | null
          amount_paid?: number | null
          business_entity_id?: string | null
          created_at?: string | null
          end_date?: string
          estimated_tax_due?: number | null
          id?: string
          period_type?: string
          quarter?: number | null
          start_date?: string
          status?: string
          tax_year?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tax_periods_business_entity"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_settings: {
        Row: {
          auto_categorize_expenses: boolean | null
          business_entity_id: string | null
          business_type: string | null
          created_at: string | null
          default_deduction_categories: Json | null
          filing_status: string | null
          id: string
          notification_preferences: Json | null
          quarterly_filing: boolean | null
          state_tax_id: string | null
          tax_id_number: string | null
          tax_year_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_categorize_expenses?: boolean | null
          business_entity_id?: string | null
          business_type?: string | null
          created_at?: string | null
          default_deduction_categories?: Json | null
          filing_status?: string | null
          id?: string
          notification_preferences?: Json | null
          quarterly_filing?: boolean | null
          state_tax_id?: string | null
          tax_id_number?: string | null
          tax_year_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_categorize_expenses?: boolean | null
          business_entity_id?: string | null
          business_type?: string | null
          created_at?: string | null
          default_deduction_categories?: Json | null
          filing_status?: string | null
          id?: string
          notification_preferences?: Json | null
          quarterly_filing?: boolean | null
          state_tax_id?: string | null
          tax_id_number?: string | null
          tax_year_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tax_settings_business_entity"
            columns: ["business_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string | null
          cost_center: string | null
          cost_center_id: string | null
          created_at: string | null
          currency_id: string
          date: string
          description: string | null
          id: string
          is_recurring: boolean | null
          notes: string | null
          revenue_stream_id: string | null
          subcategory: string | null
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category?: string | null
          cost_center?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          currency_id: string
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          revenue_stream_id?: string | null
          subcategory?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string | null
          cost_center?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          currency_id?: string
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          revenue_stream_id?: string | null
          subcategory?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_revenue_stream_id_fkey"
            columns: ["revenue_stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          date_format: string | null
          default_currency_id: string | null
          fiscal_year_start: string | null
          id: string
          notification_preferences: Json | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_format?: string | null
          default_currency_id?: string | null
          fiscal_year_start?: string | null
          id?: string
          notification_preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_format?: string | null
          default_currency_id?: string | null
          fiscal_year_start?: string | null
          id?: string
          notification_preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_default_currency_id_fkey"
            columns: ["default_currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          last_active: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          last_active?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          last_active?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      voice_entries: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          parsed: Json | null
          processed_at: string | null
          status: string | null
          storage_path: string
          transcript: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          parsed?: Json | null
          processed_at?: string | null
          status?: string | null
          storage_path: string
          transcript?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          parsed?: Json | null
          processed_at?: string | null
          status?: string | null
          storage_path?: string
          transcript?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_security_event: {
        Args: {
          p_user_id: string
          p_action_type: string
          p_action_description: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
