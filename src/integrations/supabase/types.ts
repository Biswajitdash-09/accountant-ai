export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
      activity_feeds: {
        Row: {
          action_description: string
          action_type: string
          affected_resource_id: string | null
          affected_resource_type: string | null
          created_at: string | null
          entity_id: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_description: string
          action_type: string
          affected_resource_id?: string | null
          affected_resource_type?: string | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_description?: string
          action_type?: string
          affected_resource_id?: string | null
          affected_resource_type?: string | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feeds_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          cost_estimate: number | null
          created_at: string | null
          feature: string
          id: string
          model: string
          tokens_used: number
          user_id: string
        }
        Insert: {
          cost_estimate?: number | null
          created_at?: string | null
          feature: string
          id?: string
          model: string
          tokens_used: number
          user_id: string
        }
        Update: {
          cost_estimate?: number | null
          created_at?: string | null
          feature?: string
          id?: string
          model?: string
          tokens_used?: number
          user_id?: string
        }
        Relationships: []
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      bank_connections: {
        Row: {
          account_name: string | null
          account_type: string | null
          balance: number | null
          consent_expires_at: string | null
          consent_id: string | null
          created_at: string
          currency: string | null
          encrypted_access_token: string | null
          encrypted_refresh_token: string | null
          id: string
          last_sync_at: string | null
          metadata: Json | null
          provider: string
          provider_account_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name?: string | null
          account_type?: string | null
          balance?: number | null
          consent_expires_at?: string | null
          consent_id?: string | null
          created_at?: string
          currency?: string | null
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          provider: string
          provider_account_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string | null
          account_type?: string | null
          balance?: number | null
          consent_expires_at?: string | null
          consent_id?: string | null
          created_at?: string
          currency?: string | null
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          provider?: string
          provider_account_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      barcode_scans: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          parsed_data: Json
          raw_content: string
          scan_type: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          parsed_data?: Json
          raw_content: string
          scan_type: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          parsed_data?: Json
          raw_content?: string
          scan_type?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      barcode_spreadsheets: {
        Row: {
          created_at: string | null
          description: string | null
          headers: Json
          id: string
          is_active: boolean
          rows: Json
          source_scan_id: string | null
          title: string
          updated_at: string | null
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          headers?: Json
          id?: string
          is_active?: boolean
          rows?: Json
          source_scan_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          headers?: Json
          id?: string
          is_active?: boolean
          rows?: Json
          source_scan_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "barcode_spreadsheets_source_scan_id_fkey"
            columns: ["source_scan_id"]
            isOneToOne: false
            referencedRelation: "barcode_scans"
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
      chat_history: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message_content: string
          message_type: string
          metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message_content: string
          message_type: string
          metadata?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message_content?: string
          message_type?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      collaboration_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          entity_id: string | null
          expires_at: string
          id: string
          invite_token: string
          invitee_email: string
          inviter_id: string
          permissions: Json
          role_type: string
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          entity_id?: string | null
          expires_at: string
          id?: string
          invite_token: string
          invitee_email: string
          inviter_id: string
          permissions?: Json
          role_type: string
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          entity_id?: string | null
          expires_at?: string
          id?: string
          invite_token?: string
          invitee_email?: string
          inviter_id?: string
          permissions?: Json
          role_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_invites_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
        ]
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
      crypto_assets: {
        Row: {
          avg_buy_price: number
          created_at: string | null
          id: string
          quantity: number
          symbol: string
          user_id: string
        }
        Insert: {
          avg_buy_price: number
          created_at?: string | null
          id?: string
          quantity: number
          symbol: string
          user_id: string
        }
        Update: {
          avg_buy_price?: number
          created_at?: string | null
          id?: string
          quantity?: number
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      crypto_holdings: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          last_price_usd: number
          token_address: string | null
          token_name: string
          token_symbol: string
          updated_at: string | null
          value_usd: number
          wallet_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          id?: string
          last_price_usd?: number
          token_address?: string | null
          token_name: string
          token_symbol: string
          updated_at?: string | null
          value_usd?: number
          wallet_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          last_price_usd?: number
          token_address?: string | null
          token_name?: string
          token_symbol?: string
          updated_at?: string | null
          value_usd?: number
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_holdings_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "crypto_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_nfts: {
        Row: {
          acquired_at: string | null
          collection: string | null
          created_at: string | null
          floor_price_usd: number | null
          id: string
          image_url: string | null
          metadata: Json | null
          name: string | null
          token_address: string
          token_id: string
          updated_at: string | null
          wallet_id: string
        }
        Insert: {
          acquired_at?: string | null
          collection?: string | null
          created_at?: string | null
          floor_price_usd?: number | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string | null
          token_address: string
          token_id: string
          updated_at?: string | null
          wallet_id: string
        }
        Update: {
          acquired_at?: string | null
          collection?: string | null
          created_at?: string | null
          floor_price_usd?: number | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string | null
          token_address?: string
          token_id?: string
          updated_at?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_nfts_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "crypto_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_prices: {
        Row: {
          created_at: string | null
          id: string
          last_updated: string
          market_cap: number | null
          name: string | null
          price_change_24h: number | null
          price_usd: number
          symbol: string
          volume_24h: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_updated: string
          market_cap?: number | null
          name?: string | null
          price_change_24h?: number | null
          price_usd: number
          symbol: string
          volume_24h?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated?: string
          market_cap?: number | null
          name?: string | null
          price_change_24h?: number | null
          price_usd?: number
          symbol?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      crypto_transactions: {
        Row: {
          created_at: string | null
          from_address: string
          gas_fee: number | null
          id: string
          status: string | null
          timestamp: string
          to_address: string
          token_symbol: string | null
          transaction_hash: string
          transaction_type: string
          value: number
          wallet_id: string
        }
        Insert: {
          created_at?: string | null
          from_address: string
          gas_fee?: number | null
          id?: string
          status?: string | null
          timestamp: string
          to_address: string
          token_symbol?: string | null
          transaction_hash: string
          transaction_type: string
          value?: number
          wallet_id: string
        }
        Update: {
          created_at?: string | null
          from_address?: string
          gas_fee?: number | null
          id?: string
          status?: string | null
          timestamp?: string
          to_address?: string
          token_symbol?: string | null
          transaction_hash?: string
          transaction_type?: string
          value?: number
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "crypto_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_wallets: {
        Row: {
          blockchain: string
          connected_at: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          last_synced_at: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Insert: {
          blockchain?: string
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          last_synced_at?: string | null
          updated_at?: string | null
          user_id: string
          wallet_address: string
          wallet_type?: string
        }
        Update: {
          blockchain?: string
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          last_synced_at?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
          wallet_type?: string
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
      custom_reports: {
        Row: {
          business_entity_id: string | null
          created_at: string | null
          filters: Json | null
          id: string
          is_active: boolean | null
          is_scheduled: boolean | null
          report_config: Json
          report_name: string
          report_type: string
          schedule_config: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_entity_id?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          is_scheduled?: boolean | null
          report_config?: Json
          report_name: string
          report_type: string
          schedule_config?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_entity_id?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_active?: boolean | null
          is_scheduled?: boolean | null
          report_config?: Json
          report_name?: string
          report_type?: string
          schedule_config?: Json | null
          updated_at?: string | null
          user_id?: string
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
      document_ai_analysis: {
        Row: {
          analysis_type: string
          confidence_score: number | null
          created_at: string | null
          document_id: string | null
          extracted_data: Json | null
          id: string
          suggested_categorization: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_type: string
          confidence_score?: number | null
          created_at?: string | null
          document_id?: string | null
          extracted_data?: Json | null
          id?: string
          suggested_categorization?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string | null
          document_id?: string | null
          extracted_data?: Json | null
          id?: string
          suggested_categorization?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_ai_analysis_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
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
      entity_relationships: {
        Row: {
          child_entity_id: string | null
          created_at: string | null
          id: string
          ownership_percentage: number | null
          parent_entity_id: string | null
          relationship_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          child_entity_id?: string | null
          created_at?: string | null
          id?: string
          ownership_percentage?: number | null
          parent_entity_id?: string | null
          relationship_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          child_entity_id?: string | null
          created_at?: string | null
          id?: string
          ownership_percentage?: number | null
          parent_entity_id?: string | null
          relationship_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_relationships_child_entity_id_fkey"
            columns: ["child_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_relationships_parent_entity_id_fkey"
            columns: ["parent_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          base_currency_id: string
          created_at: string | null
          id: string
          rate: number
          rate_date: string
          source: string | null
          target_currency_id: string
          updated_at: string | null
        }
        Insert: {
          base_currency_id: string
          created_at?: string | null
          id?: string
          rate: number
          rate_date?: string
          source?: string | null
          target_currency_id: string
          updated_at?: string | null
        }
        Update: {
          base_currency_id?: string
          created_at?: string | null
          id?: string
          rate?: number
          rate_date?: string
          source?: string | null
          target_currency_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exchange_rates_base_currency_id_fkey"
            columns: ["base_currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exchange_rates_target_currency_id_fkey"
            columns: ["target_currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
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
      hmrc_connections: {
        Row: {
          connected_at: string | null
          connection_status: Database["public"]["Enums"]["hmrc_connection_status"]
          created_at: string | null
          expires_at: string | null
          hmrc_account_id: string | null
          id: string
          last_activity_at: string | null
          metadata: Json | null
          scopes: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connected_at?: string | null
          connection_status?: Database["public"]["Enums"]["hmrc_connection_status"]
          created_at?: string | null
          expires_at?: string | null
          hmrc_account_id?: string | null
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          scopes?: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connected_at?: string | null
          connection_status?: Database["public"]["Enums"]["hmrc_connection_status"]
          created_at?: string | null
          expires_at?: string | null
          hmrc_account_id?: string | null
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          scopes?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hmrc_data_sync: {
        Row: {
          connection_id: string
          created_at: string | null
          data_type: Database["public"]["Enums"]["hmrc_data_type"]
          error_details: Json | null
          error_message: string | null
          id: string
          last_sync_at: string | null
          next_sync_at: string | null
          records_synced: number | null
          sync_status: Database["public"]["Enums"]["hmrc_sync_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string | null
          data_type: Database["public"]["Enums"]["hmrc_data_type"]
          error_details?: Json | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          next_sync_at?: string | null
          records_synced?: number | null
          sync_status?: Database["public"]["Enums"]["hmrc_sync_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string | null
          data_type?: Database["public"]["Enums"]["hmrc_data_type"]
          error_details?: Json | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          next_sync_at?: string | null
          records_synced?: number | null
          sync_status?: Database["public"]["Enums"]["hmrc_sync_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hmrc_data_sync_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "hmrc_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      hmrc_tax_data: {
        Row: {
          connection_id: string
          created_at: string | null
          data: Json
          data_type: Database["public"]["Enums"]["hmrc_data_type"]
          fetched_at: string | null
          id: string
          tax_year: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string | null
          data?: Json
          data_type: Database["public"]["Enums"]["hmrc_data_type"]
          fetched_at?: string | null
          id?: string
          tax_year: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string | null
          data?: Json
          data_type?: Database["public"]["Enums"]["hmrc_data_type"]
          fetched_at?: string | null
          id?: string
          tax_year?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hmrc_tax_data_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "hmrc_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      hmrc_tokens: {
        Row: {
          access_token: string
          connection_id: string
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string
          scopes: string[]
          token_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          connection_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token: string
          scopes?: string[]
          token_type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          connection_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string
          scopes?: string[]
          token_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hmrc_tokens_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "hmrc_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connections: {
        Row: {
          configuration: Json | null
          connection_name: string
          created_at: string | null
          credentials: Json
          id: string
          integration_type: string
          last_sync_at: string | null
          next_sync_at: string | null
          status: string | null
          sync_frequency: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          configuration?: Json | null
          connection_name: string
          created_at?: string | null
          credentials?: Json
          id?: string
          integration_type: string
          last_sync_at?: string | null
          next_sync_at?: string | null
          status?: string | null
          sync_frequency?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          configuration?: Json | null
          connection_name?: string
          created_at?: string | null
          credentials?: Json
          id?: string
          integration_type?: string
          last_sync_at?: string | null
          next_sync_at?: string | null
          status?: string | null
          sync_frequency?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      inter_entity_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency_id: string | null
          description: string | null
          from_entity_id: string | null
          id: string
          reference_number: string | null
          status: string | null
          to_entity_id: string | null
          transaction_date: string
          transaction_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency_id?: string | null
          description?: string | null
          from_entity_id?: string | null
          id?: string
          reference_number?: string | null
          status?: string | null
          to_entity_id?: string | null
          transaction_date?: string
          transaction_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency_id?: string | null
          description?: string | null
          from_entity_id?: string | null
          id?: string
          reference_number?: string | null
          status?: string | null
          to_entity_id?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inter_entity_transactions_from_entity_id_fkey"
            columns: ["from_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inter_entity_transactions_to_entity_id_fkey"
            columns: ["to_entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_alerts: {
        Row: {
          alert_date: string
          alert_type: string
          created_at: string | null
          id: string
          investment_id: string | null
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          user_id: string
        }
        Insert: {
          alert_date: string
          alert_type: string
          created_at?: string | null
          id?: string
          investment_id?: string | null
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          user_id: string
        }
        Update: {
          alert_date?: string
          alert_type?: string
          created_at?: string | null
          id?: string
          investment_id?: string | null
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_alerts_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "user_investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_portfolio: {
        Row: {
          asset_type: string
          created_at: string | null
          currency_id: string | null
          id: string
          notes: string | null
          purchase_date: string
          purchase_price: number
          quantity: number
          symbol: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asset_type: string
          created_at?: string | null
          currency_id?: string | null
          id?: string
          notes?: string | null
          purchase_date: string
          purchase_price: number
          quantity: number
          symbol: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asset_type?: string
          created_at?: string | null
          currency_id?: string | null
          id?: string
          notes?: string | null
          purchase_date?: string
          purchase_price?: number
          quantity?: number
          symbol?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_portfolio_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
      }
      mono_connections: {
        Row: {
          account_id: string
          account_name: string | null
          created_at: string | null
          id: string
          institution_name: string | null
          institution_type: string | null
          last_sync_at: string | null
          mono_code: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          account_name?: string | null
          created_at?: string | null
          id?: string
          institution_name?: string | null
          institution_type?: string | null
          last_sync_at?: string | null
          mono_code: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          account_name?: string | null
          created_at?: string | null
          id?: string
          institution_name?: string | null
          institution_type?: string | null
          last_sync_at?: string | null
          mono_code?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      oauth_states: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          provider: string
          state: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          provider: string
          state: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          provider?: string
          state?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_webhook_logs: {
        Row: {
          id: string
          payload: Json
          provider: string
          raw_headers: Json
          received_at: string
          signature: string | null
          status: string
        }
        Insert: {
          id?: string
          payload?: Json
          provider: string
          raw_headers?: Json
          received_at?: string
          signature?: string | null
          status?: string
        }
        Update: {
          id?: string
          payload?: Json
          provider?: string
          raw_headers?: Json
          received_at?: string
          signature?: string | null
          status?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          credits: number
          currency: string
          failure_reason: string | null
          id: string
          metadata: Json | null
          payment_link: string | null
          payment_method: string | null
          plan_id: string
          plan_name: string | null
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          provider_session_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          upi_vpa: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credits: number
          currency?: string
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          payment_link?: string | null
          payment_method?: string | null
          plan_id: string
          plan_name?: string | null
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_session_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          upi_vpa?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credits?: number
          currency?: string
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          payment_link?: string | null
          payment_method?: string | null
          plan_id?: string
          plan_name?: string | null
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_session_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          upi_vpa?: string | null
          user_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number | null
          recorded_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value?: number | null
          recorded_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number | null
          recorded_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      plaid_connections: {
        Row: {
          access_token: string
          accounts: Json | null
          created_at: string | null
          id: string
          institution_id: string | null
          institution_name: string | null
          item_id: string
          last_sync_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          accounts?: Json | null
          created_at?: string | null
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          item_id: string
          last_sync_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          accounts?: Json | null
          created_at?: string | null
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          item_id?: string
          last_sync_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accounting_software: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          fiscal_year_end: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          onboarding_step: number | null
          preferred_language: string | null
          region: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          accounting_software?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          fiscal_year_end?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preferred_language?: string | null
          region?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          accounting_software?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          fiscal_year_end?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preferred_language?: string | null
          region?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      query_cache: {
        Row: {
          access_count: number | null
          cache_data: Json
          cache_key: string
          created_at: string | null
          expires_at: string
          id: string
          last_accessed: string | null
          user_id: string | null
        }
        Insert: {
          access_count?: number | null
          cache_data: Json
          cache_key: string
          created_at?: string | null
          expires_at: string
          id?: string
          last_accessed?: string | null
          user_id?: string | null
        }
        Update: {
          access_count?: number | null
          cache_data?: Json
          cache_key?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          last_accessed?: string | null
          user_id?: string | null
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
      report_executions: {
        Row: {
          error_message: string | null
          execution_status: string | null
          execution_time_ms: number | null
          file_path: string | null
          generated_at: string | null
          id: string
          report_id: string | null
          user_id: string
        }
        Insert: {
          error_message?: string | null
          execution_status?: string | null
          execution_time_ms?: number | null
          file_path?: string | null
          generated_at?: string | null
          id?: string
          report_id?: string | null
          user_id: string
        }
        Update: {
          error_message?: string | null
          execution_status?: string | null
          execution_time_ms?: number | null
          file_path?: string | null
          generated_at?: string | null
          id?: string
          report_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_executions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "custom_reports"
            referencedColumns: ["id"]
          },
        ]
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
      saved_tax_calculations: {
        Row: {
          breakdown: Json
          calculation_date: string
          country: string
          created_at: string | null
          effective_rate: number
          filing_status: string | null
          id: string
          income: number
          notes: string | null
          total_tax: number
          user_id: string
        }
        Insert: {
          breakdown?: Json
          calculation_date?: string
          country: string
          created_at?: string | null
          effective_rate: number
          filing_status?: string | null
          id?: string
          income: number
          notes?: string | null
          total_tax: number
          user_id: string
        }
        Update: {
          breakdown?: Json
          calculation_date?: string
          country?: string
          created_at?: string | null
          effective_rate?: number
          filing_status?: string | null
          id?: string
          income?: number
          notes?: string | null
          total_tax?: number
          user_id?: string
        }
        Relationships: []
      }
      scheduled_reports: {
        Row: {
          created_at: string | null
          data_types: string[]
          email: string
          filters: Json | null
          format: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          next_send_at: string | null
          report_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_types: string[]
          email: string
          filters?: Json | null
          format?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          next_send_at?: string | null
          report_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_types?: string[]
          email?: string
          filters?: Json | null
          format?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          next_send_at?: string | null
          report_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action_description: string
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      setu_connections: {
        Row: {
          account_details: Json | null
          account_id: string
          account_type: string | null
          consent_id: string | null
          consent_status: string | null
          created_at: string | null
          fip_id: string | null
          fip_name: string | null
          id: string
          last_sync_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_details?: Json | null
          account_id: string
          account_type?: string | null
          consent_id?: string | null
          consent_status?: string | null
          created_at?: string | null
          fip_id?: string | null
          fip_name?: string | null
          id?: string
          last_sync_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_details?: Json | null
          account_id?: string
          account_type?: string | null
          consent_id?: string | null
          consent_status?: string | null
          created_at?: string | null
          fip_id?: string | null
          fip_name?: string | null
          id?: string
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          completed_at: string | null
          errors_count: number | null
          id: string
          integration_id: string | null
          records_processed: number | null
          started_at: string | null
          status: string
          sync_details: Json | null
          sync_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          errors_count?: number | null
          id?: string
          integration_id?: string | null
          records_processed?: number | null
          started_at?: string | null
          status: string
          sync_details?: Json | null
          sync_type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          errors_count?: number | null
          id?: string
          integration_id?: string | null
          records_processed?: number | null
          started_at?: string | null
          status?: string
          sync_details?: Json | null
          sync_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integration_connections"
            referencedColumns: ["id"]
          },
        ]
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
      tax_calendar_events: {
        Row: {
          amount: number | null
          business_entity_id: string | null
          created_at: string | null
          description: string | null
          due_date: string
          event_date: string
          event_title: string
          event_type: string
          id: string
          is_recurring: boolean | null
          metadata: Json | null
          recurrence_pattern: string | null
          reminder_days: number[] | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          business_entity_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          event_date: string
          event_title: string
          event_type: string
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          recurrence_pattern?: string | null
          reminder_days?: number[] | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          business_entity_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          event_date?: string
          event_title?: string
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          recurrence_pattern?: string | null
          reminder_days?: number[] | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tax_compliance_checks: {
        Row: {
          business_entity_id: string | null
          check_type: string
          checked_at: string | null
          id: string
          issues_found: Json | null
          recommendations: Json | null
          resolved_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          business_entity_id?: string | null
          check_type: string
          checked_at?: string | null
          id?: string
          issues_found?: Json | null
          recommendations?: Json | null
          resolved_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          business_entity_id?: string | null
          check_type?: string
          checked_at?: string | null
          id?: string
          issues_found?: Json | null
          recommendations?: Json | null
          resolved_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
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
      tax_filing_submissions: {
        Row: {
          confirmation_number: string | null
          country: string
          created_at: string
          filing_method: string
          filing_status: string | null
          id: string
          submission_data: Json | null
          submitted_at: string | null
          tax_period_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confirmation_number?: string | null
          country: string
          created_at?: string
          filing_method: string
          filing_status?: string | null
          id?: string
          submission_data?: Json | null
          submitted_at?: string | null
          tax_period_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confirmation_number?: string | null
          country?: string
          created_at?: string
          filing_method?: string
          filing_status?: string | null
          id?: string
          submission_data?: Json | null
          submitted_at?: string | null
          tax_period_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_filing_submissions_tax_period_id_fkey"
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
      tax_rules: {
        Row: {
          actions: Json
          business_entity_id: string | null
          conditions: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          rule_name: string
          rule_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions?: Json
          business_entity_id?: string | null
          conditions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name: string
          rule_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json
          business_entity_id?: string | null
          conditions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name?: string
          rule_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      tax_strategies: {
        Row: {
          created_at: string | null
          description: string
          estimated_savings: number | null
          id: string
          implementation_date: string | null
          notes: string | null
          status: string | null
          strategy_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          estimated_savings?: number | null
          id?: string
          implementation_date?: string | null
          notes?: string | null
          status?: string | null
          strategy_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          estimated_savings?: number | null
          id?: string
          implementation_date?: string | null
          notes?: string | null
          status?: string | null
          strategy_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transaction_classifications: {
        Row: {
          ai_category: string | null
          ai_comment: string | null
          ai_type: string | null
          confidence_score: number | null
          created_at: string
          id: string
          is_tax_deductible: boolean | null
          manual_override: boolean | null
          tax_category: string | null
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_category?: string | null
          ai_comment?: string | null
          ai_type?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_tax_deductible?: boolean | null
          manual_override?: boolean | null
          tax_category?: string | null
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_category?: string | null
          ai_comment?: string | null
          ai_type?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_tax_deductible?: boolean | null
          manual_override?: boolean | null
          tax_category?: string | null
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_classifications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_sync_logs: {
        Row: {
          bank_connection_id: string | null
          completed_at: string | null
          error_message: string | null
          id: string
          started_at: string
          status: string
          sync_type: string
          transactions_classified: number | null
          transactions_imported: number | null
          user_id: string
        }
        Insert: {
          bank_connection_id?: string | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
          sync_type: string
          transactions_classified?: number | null
          transactions_imported?: number | null
          user_id: string
        }
        Update: {
          bank_connection_id?: string | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
          sync_type?: string
          transactions_classified?: number | null
          transactions_imported?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_sync_logs_bank_connection_id_fkey"
            columns: ["bank_connection_id"]
            isOneToOne: false
            referencedRelation: "bank_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          bank_connection_id: string | null
          category: string | null
          cost_center: string | null
          cost_center_id: string | null
          created_at: string | null
          currency_id: string
          data_source_metadata: Json | null
          date: string
          description: string | null
          id: string
          is_recurring: boolean | null
          merchant_name: string | null
          notes: string | null
          provider_transaction_id: string | null
          raw_data: Json | null
          revenue_stream_id: string | null
          subcategory: string | null
          sync_status: string | null
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          bank_connection_id?: string | null
          category?: string | null
          cost_center?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          currency_id: string
          data_source_metadata?: Json | null
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          merchant_name?: string | null
          notes?: string | null
          provider_transaction_id?: string | null
          raw_data?: Json | null
          revenue_stream_id?: string | null
          subcategory?: string | null
          sync_status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          bank_connection_id?: string | null
          category?: string | null
          cost_center?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          currency_id?: string
          data_source_metadata?: Json | null
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          merchant_name?: string | null
          notes?: string | null
          provider_transaction_id?: string | null
          raw_data?: Json | null
          revenue_stream_id?: string | null
          subcategory?: string | null
          sync_status?: string | null
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
            foreignKeyName: "transactions_bank_connection_id_fkey"
            columns: ["bank_connection_id"]
            isOneToOne: false
            referencedRelation: "bank_connections"
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
      truelayer_connections: {
        Row: {
          access_token: string
          account_id: string | null
          account_name: string | null
          created_at: string | null
          expires_at: string
          id: string
          institution_name: string | null
          last_sync_at: string | null
          provider_id: string
          refresh_token: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          account_id?: string | null
          account_name?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          institution_name?: string | null
          last_sync_at?: string | null
          provider_id: string
          refresh_token: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          account_id?: string | null
          account_name?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          institution_name?: string | null
          last_sync_at?: string | null
          provider_id?: string
          refresh_token?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          daily_free_credits: number
          id: string
          last_reset_date: string
          subscription_tier: string
          total_credits: number
          updated_at: string
          used_credits: number
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_free_credits?: number
          id?: string
          last_reset_date?: string
          subscription_tier?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id: string
        }
        Update: {
          created_at?: string
          daily_free_credits?: number
          id?: string
          last_reset_date?: string
          subscription_tier?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id?: string
        }
        Relationships: []
      }
      user_investments: {
        Row: {
          created_at: string | null
          currency_id: string | null
          current_value: number | null
          id: string
          investment_type: string
          last_updated: string | null
          name: string
          notes: string | null
          purchase_date: string
          purchase_price: number
          quantity: number
          symbol: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency_id?: string | null
          current_value?: number | null
          id?: string
          investment_type: string
          last_updated?: string | null
          name: string
          notes?: string | null
          purchase_date: string
          purchase_price: number
          quantity: number
          symbol?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency_id?: string | null
          current_value?: number | null
          id?: string
          investment_type?: string
          last_updated?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string
          purchase_price?: number
          quantity?: number
          symbol?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_investments_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_locations: {
        Row: {
          country_code: string | null
          country_name: string | null
          created_at: string
          currency: string | null
          detected_from_ip: boolean | null
          id: string
          manual_override: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          currency?: string | null
          detected_from_ip?: boolean | null
          id?: string
          manual_override?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          currency?: string | null
          detected_from_ip?: boolean | null
          id?: string
          manual_override?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          entity_id: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string
          id: string
          is_active: boolean | null
          permissions: Json
          role_type: string
          user_id: string
        }
        Insert: {
          entity_id?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by: string
          id?: string
          is_active?: boolean | null
          permissions?: Json
          role_type: string
          user_id: string
        }
        Update: {
          entity_id?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string
          id?: string
          is_active?: boolean | null
          permissions?: Json
          role_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "business_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          last_active: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          last_active?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
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
      yodlee_connections: {
        Row: {
          access_token: string
          account_name: string | null
          created_at: string | null
          id: string
          institution_name: string | null
          last_sync_at: string | null
          provider_account_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          yodlee_user_id: string
        }
        Insert: {
          access_token: string
          account_name?: string | null
          created_at?: string | null
          id?: string
          institution_name?: string | null
          last_sync_at?: string | null
          provider_account_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          yodlee_user_id: string
        }
        Update: {
          access_token?: string
          account_name?: string | null
          created_at?: string | null
          id?: string
          institution_name?: string | null
          last_sync_at?: string | null
          provider_account_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          yodlee_user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      mv_user_cash_flow: {
        Row: {
          month: string | null
          net_cash_flow: number | null
          total_expenses: number | null
          total_income: number | null
          user_id: string | null
        }
        Relationships: []
      }
      mv_user_category_spending: {
        Row: {
          avg_transaction: number | null
          category: string | null
          month: string | null
          total_spent: number | null
          transaction_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
      mv_user_total_assets: {
        Row: {
          crypto_balance: number | null
          investment_balance: number | null
          last_updated: string | null
          total_assets: number | null
          traditional_balance: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_add_credits: {
        Args: { p_credits_to_add: number; p_user_id: string }
        Returns: boolean
      }
      cache_upsert: {
        Args: {
          p_cache_data: Json
          p_cache_key: string
          p_expires_at: string
          p_user_scoped?: boolean
        }
        Returns: string
      }
      get_user_crypto_assets: {
        Args: { p_user_id?: string }
        Returns: {
          avg_buy_price: number
          created_at: string
          id: string
          quantity: number
          symbol: string
          user_id: string
        }[]
      }
      has_role: {
        Args: { _role_type: string; _user_id: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_action_description: string
          p_action_type: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_user_agent?: string
        }
        Returns: undefined
      }
      refresh_financial_views: { Args: never; Returns: undefined }
      reset_daily_credits: { Args: { user_id: string }; Returns: boolean }
      user_use_credits: {
        Args: { p_credits_to_use?: number }
        Returns: boolean
      }
    }
    Enums: {
      hmrc_connection_status: "active" | "expired" | "disconnected" | "pending"
      hmrc_data_type:
        | "self_assessment"
        | "vat_return"
        | "income"
        | "obligations"
        | "payment_history"
      hmrc_sync_status: "pending" | "in_progress" | "completed" | "failed"
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
    Enums: {
      hmrc_connection_status: ["active", "expired", "disconnected", "pending"],
      hmrc_data_type: [
        "self_assessment",
        "vat_return",
        "income",
        "obligations",
        "payment_history",
      ],
      hmrc_sync_status: ["pending", "in_progress", "completed", "failed"],
    },
  },
} as const
