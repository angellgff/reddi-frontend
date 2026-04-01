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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      banner_clicks: {
        Row: {
          banner_id: string
          clicked_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          banner_id: string
          clicked_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          banner_id?: string
          clicked_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_clicks_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banner_clicks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          action_link: string | null
          category_id: string | null
          coupon_id: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          id: string
          image_url: string
          is_active: boolean
          placement: Database["public"]["Enums"]["banner_placement"] | null
          start_date: string
          title: string
        }
        Insert: {
          action_link?: string | null
          category_id?: string | null
          coupon_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          image_url: string
          is_active?: boolean
          placement?: Database["public"]["Enums"]["banner_placement"] | null
          start_date: string
          title: string
        }
        Update: {
          action_link?: string | null
          category_id?: string | null
          coupon_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          image_url?: string
          is_active?: boolean
          placement?: Database["public"]["Enums"]["banner_placement"] | null
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "banners_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banners_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_customers: {
        Row: {
          billing_provider: string
          created_at: string
          stripe_customer_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_provider?: string
          created_at?: string
          stripe_customer_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_provider?: string
          created_at?: string
          stripe_customer_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          order_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          order_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          order_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          id: string
          order_id: string
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          order_id: string
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          order_id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value: number
          end_date: string
          id: string
          max_uses: number | null
          max_uses_per_user: number | null
          minimum_purchase_amount: number
          start_date: string
          status: Database["public"]["Enums"]["coupon_status"]
          times_used: number
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value: number
          end_date: string
          id?: string
          max_uses?: number | null
          max_uses_per_user?: number | null
          minimum_purchase_amount?: number
          start_date: string
          status?: Database["public"]["Enums"]["coupon_status"]
          times_used?: number
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value?: number
          end_date?: string
          id?: string
          max_uses?: number | null
          max_uses_per_user?: number | null
          minimum_purchase_amount?: number
          start_date?: string
          status?: Database["public"]["Enums"]["coupon_status"]
          times_used?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_pricing_rules: {
        Row: {
          base_fee: number
          created_at: string
          fee_per_kilometer: number
          id: string
          is_active: boolean
          max_fee: number | null
          min_fee: number | null
          name: string
        }
        Insert: {
          base_fee?: number
          created_at?: string
          fee_per_kilometer?: number
          id?: string
          is_active?: boolean
          max_fee?: number | null
          min_fee?: number | null
          name: string
        }
        Update: {
          base_fee?: number
          created_at?: string
          fee_per_kilometer?: number
          id?: string
          is_active?: boolean
          max_fee?: number | null
          min_fee?: number | null
          name?: string
        }
        Relationships: []
      }
      driver_cash_logs: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          driver_id: string
          id: string
          order_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          driver_id: string
          id?: string
          order_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          driver_id?: string
          id?: string
          order_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_cash_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_cash_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_cash_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "view_driver_balances"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "driver_cash_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          background_check_url: string | null
          created_at: string
          current_location: unknown
          driver_license_url: string | null
          id: string
          identity_card_url: string | null
          is_approved: boolean
          status: Database["public"]["Enums"]["driver_status"]
          user_id: string
          vehicle_details: Json | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          background_check_url?: string | null
          created_at?: string
          current_location?: unknown
          driver_license_url?: string | null
          id?: string
          identity_card_url?: string | null
          is_approved?: boolean
          status?: Database["public"]["Enums"]["driver_status"]
          user_id: string
          vehicle_details?: Json | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          background_check_url?: string | null
          created_at?: string
          current_location?: unknown
          driver_license_url?: string | null
          id?: string
          identity_card_url?: string | null
          is_approved?: boolean
          status?: Database["public"]["Enums"]["driver_status"]
          user_id?: string
          vehicle_details?: Json | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_access_attempts: {
        Row: {
          created_at: string
          device_fingerprint_hash: string | null
          id: number
          ip_hash: string | null
          phone_e164: string | null
          reason: string | null
          result: string
          store_id: string | null
          user_agent_hash: string | null
        }
        Insert: {
          created_at?: string
          device_fingerprint_hash?: string | null
          id?: number
          ip_hash?: string | null
          phone_e164?: string | null
          reason?: string | null
          result: string
          store_id?: string | null
          user_agent_hash?: string | null
        }
        Update: {
          created_at?: string
          device_fingerprint_hash?: string | null
          id?: number
          ip_hash?: string | null
          phone_e164?: string | null
          reason?: string | null
          result?: string
          store_id?: string | null
          user_agent_hash?: string | null
        }
        Relationships: []
      }
      guest_chat_messages: {
        Row: {
          content: string
          created_at: string
          guest_order_link_id: string
          id: string
          is_read: boolean
          message_type: string
          metadata: Json
          order_id: string
          sender_profile_id: string | null
          sender_role: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          guest_order_link_id: string
          id?: string
          is_read?: boolean
          message_type?: string
          metadata?: Json
          order_id: string
          sender_profile_id?: string | null
          sender_role: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          guest_order_link_id?: string
          id?: string
          is_read?: boolean
          message_type?: string
          metadata?: Json
          order_id?: string
          sender_profile_id?: string | null
          sender_role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_chat_messages_guest_order_link_id_fkey"
            columns: ["guest_order_link_id"]
            isOneToOne: false
            referencedRelation: "guest_order_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_chat_messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_order_links: {
        Row: {
          amount_total: number | null
          created_at: string
          currency: string
          customer_first_name: string
          customer_last_name: string
          customer_phone_e164: string
          expires_at: string
          guest_session_id: string
          id: string
          metadata: Json
          order_id: string
          order_status_snapshot: string | null
          payment_provider: string
          payment_status: string
          store_id: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          tracking_token: string
          updated_at: string
        }
        Insert: {
          amount_total?: number | null
          created_at?: string
          currency?: string
          customer_first_name: string
          customer_last_name: string
          customer_phone_e164: string
          expires_at?: string
          guest_session_id: string
          id?: string
          metadata?: Json
          order_id: string
          order_status_snapshot?: string | null
          payment_provider?: string
          payment_status?: string
          store_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          tracking_token?: string
          updated_at?: string
        }
        Update: {
          amount_total?: number | null
          created_at?: string
          currency?: string
          customer_first_name?: string
          customer_last_name?: string
          customer_phone_e164?: string
          expires_at?: string
          guest_session_id?: string
          id?: string
          metadata?: Json
          order_id?: string
          order_status_snapshot?: string | null
          payment_provider?: string
          payment_status?: string
          store_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          tracking_token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_order_links_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_runtime_config: {
        Row: {
          fixed_store_id: string
          guest_enabled: boolean
          id: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          fixed_store_id: string
          guest_enabled?: boolean
          id?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          fixed_store_id?: string
          guest_enabled?: boolean
          id?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_runtime_config_fixed_store_id_fkey"
            columns: ["fixed_store_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_sessions: {
        Row: {
          consent_accepted: boolean
          created_at: string
          device_fingerprint_hash: string | null
          expires_at: string
          first_name: string
          id: string
          ip_hash: string | null
          last_name: string
          last_seen_at: string
          notes: string | null
          phone_e164: string
          session_token: string
          status: string
          store_id: string | null
          updated_at: string
          user_agent_hash: string | null
        }
        Insert: {
          consent_accepted?: boolean
          created_at?: string
          device_fingerprint_hash?: string | null
          expires_at?: string
          first_name: string
          id?: string
          ip_hash?: string | null
          last_name: string
          last_seen_at?: string
          notes?: string | null
          phone_e164: string
          session_token?: string
          status?: string
          store_id?: string | null
          updated_at?: string
          user_agent_hash?: string | null
        }
        Update: {
          consent_accepted?: boolean
          created_at?: string
          device_fingerprint_hash?: string | null
          expires_at?: string
          first_name?: string
          id?: string
          ip_hash?: string | null
          last_name?: string
          last_seen_at?: string
          notes?: string | null
          phone_e164?: string
          session_token?: string
          status?: string
          store_id?: string | null
          updated_at?: string
          user_agent_hash?: string | null
        }
        Relationships: []
      }
      liquor_stores: {
        Row: {
          id: string
          license_number: string | null
          specializes_in: string | null
        }
        Insert: {
          id: string
          license_number?: string | null
          specializes_in?: string | null
        }
        Update: {
          id?: string
          license_number?: string | null
          specializes_in?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_partner"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          has_bakery: boolean | null
          has_butchery: boolean | null
          id: string
        }
        Insert: {
          has_bakery?: boolean | null
          has_butchery?: boolean | null
          id: string
        }
        Update: {
          has_bakery?: boolean | null
          has_butchery?: boolean | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_partner"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      normal_users: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id?: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: number
          is_read: boolean
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_read?: boolean
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          is_read?: boolean
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_detail: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_detail_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_detail_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_detail_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_detail_extras: {
        Row: {
          created_at: string
          id: string
          product_detail: string | null
          product_extra_id: string | null
          product_section_option_id: string | null
          quantity: number
          section_id: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_detail?: string | null
          product_extra_id?: string | null
          product_section_option_id?: string | null
          quantity?: number
          section_id?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          product_detail?: string | null
          product_extra_id?: string | null
          product_section_option_id?: string | null
          quantity?: number
          section_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_detail_extras_option_fkey"
            columns: ["product_section_option_id"]
            isOneToOne: false
            referencedRelation: "product_section_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_detail_extras_product_detail_fkey"
            columns: ["product_detail"]
            isOneToOne: false
            referencedRelation: "order_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_detail_extras_section_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "product_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      order_pins: {
        Row: {
          order_id: string
          pin: string
        }
        Insert: {
          order_id: string
          pin: string
        }
        Update: {
          order_id?: string
          pin?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_pins_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          base_subtotal: number | null
          coupon_id: string | null
          created_at: string
          discount_amount: number | null
          id: string
          instructions: string | null
          partner_id: string | null
          payment_intent_id: string | null
          payment_meta: Json | null
          payment_method:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          payment_provider: string | null
          platform_profit: number | null
          scheduled_at: string | null
          shipment_id: string | null
          shipping_fee: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          tip_amount: number | null
          total_amount: number
          updated_at: string
          user_address_id: string | null
          user_id: string
        }
        Insert: {
          base_subtotal?: number | null
          coupon_id?: string | null
          created_at?: string
          discount_amount?: number | null
          id?: string
          instructions?: string | null
          partner_id?: string | null
          payment_intent_id?: string | null
          payment_meta?: Json | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          payment_provider?: string | null
          platform_profit?: number | null
          scheduled_at?: string | null
          shipment_id?: string | null
          shipping_fee?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          tip_amount?: number | null
          total_amount: number
          updated_at?: string
          user_address_id?: string | null
          user_id: string
        }
        Update: {
          base_subtotal?: number | null
          coupon_id?: string | null
          created_at?: string
          discount_amount?: number | null
          id?: string
          instructions?: string | null
          partner_id?: string | null
          payment_intent_id?: string | null
          payment_meta?: Json | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          payment_provider?: string | null
          platform_profit?: number | null
          scheduled_at?: string | null
          shipment_id?: string | null
          shipping_fee?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          tip_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_address_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_partner"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_address_id_fkey"
            columns: ["user_address_id"]
            isOneToOne: false
            referencedRelation: "user_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_placements: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          partner_id: string
          section_key: Database["public"]["Enums"]["app_section_key"]
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          partner_id: string
          section_key: Database["public"]["Enums"]["app_section_key"]
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          partner_id?: string
          section_key?: Database["public"]["Enums"]["app_section_key"]
        }
        Relationships: [
          {
            foreignKeyName: "partner_placements_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_printers: {
        Row: {
          capabilities: Json
          connection_type: string
          created_at: string
          external_printer_id: string | null
          id: string
          ip_address: string | null
          is_active: boolean
          is_default: boolean
          last_seen_at: string | null
          model: string | null
          name: string
          partner_id: string
          port: number | null
          provider: string
          updated_at: string
        }
        Insert: {
          capabilities?: Json
          connection_type: string
          created_at?: string
          external_printer_id?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          is_default?: boolean
          last_seen_at?: string | null
          model?: string | null
          name: string
          partner_id: string
          port?: number | null
          provider: string
          updated_at?: string
        }
        Update: {
          capabilities?: Json
          connection_type?: string
          created_at?: string
          external_printer_id?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          is_default?: boolean
          last_seen_at?: string | null
          model?: string | null
          name?: string
          partner_id?: string
          port?: number | null
          provider?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_printers_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          average_rating: number | null
          bank_account_number: string | null
          bank_account_type: string | null
          bank_document_url: string | null
          bank_holder_name: string | null
          bank_rnc: string | null
          billing_email: string | null
          business_hours: Json | null
          conditions_accepted: boolean | null
          coordinates: unknown
          cover_image_url: string | null
          created_at: string
          estimated_time: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_approved: boolean
          is_physical: boolean | null
          is_sponsored: boolean | null
          name: string
          partner_type: Database["public"]["Enums"]["partner_type"]
          phone: string
          platform_commission_percentage: number | null
          price_markup_percentage: number | null
          sponsor_label: string | null
          total_ratings: number | null
          user_id: string
          user_rnc: string
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_document_url?: string | null
          bank_holder_name?: string | null
          bank_rnc?: string | null
          billing_email?: string | null
          business_hours?: Json | null
          conditions_accepted?: boolean | null
          coordinates?: unknown
          cover_image_url?: string | null
          created_at?: string
          estimated_time?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_approved?: boolean
          is_physical?: boolean | null
          is_sponsored?: boolean | null
          name: string
          partner_type: Database["public"]["Enums"]["partner_type"]
          phone: string
          platform_commission_percentage?: number | null
          price_markup_percentage?: number | null
          sponsor_label?: string | null
          total_ratings?: number | null
          user_id: string
          user_rnc: string
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_document_url?: string | null
          bank_holder_name?: string | null
          bank_rnc?: string | null
          billing_email?: string | null
          business_hours?: Json | null
          conditions_accepted?: boolean | null
          coordinates?: unknown
          cover_image_url?: string | null
          created_at?: string
          estimated_time?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_approved?: boolean
          is_physical?: boolean | null
          is_sponsored?: boolean | null
          name?: string
          partner_type?: Database["public"]["Enums"]["partner_type"]
          phone?: string
          platform_commission_percentage?: number | null
          price_markup_percentage?: number | null
          sponsor_label?: string | null
          total_ratings?: number | null
          user_id?: string
          user_rnc?: string
        }
        Relationships: [
          {
            foreignKeyName: "partners_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          authorization_code: string | null
          card_number: string | null
          collected_by_driver_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          method: Database["public"]["Enums"]["payment_method_type"] | null
          order_id: string | null
          provider: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          authorization_code?: string | null
          card_number?: string | null
          collected_by_driver_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          method?: Database["public"]["Enums"]["payment_method_type"] | null
          order_id?: string | null
          provider?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          authorization_code?: string | null
          card_number?: string | null
          collected_by_driver_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          method?: Database["public"]["Enums"]["payment_method_type"] | null
          order_id?: string | null
          provider?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_collected_by_driver_id_fkey"
            columns: ["collected_by_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_collected_by_driver_id_fkey"
            columns: ["collected_by_driver_id"]
            isOneToOne: false
            referencedRelation: "view_driver_balances"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      persons: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id?: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      pharmacies: {
        Row: {
          id: string
          is_on_duty: boolean | null
          license_number: string | null
        }
        Insert: {
          id: string
          is_on_duty?: boolean | null
          license_number?: string | null
        }
        Update: {
          id?: string
          is_on_duty?: boolean | null
          license_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_partner"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      print_job_attempts: {
        Row: {
          attempt_no: number
          created_at: string
          error_message: string | null
          id: string
          print_job_id: string
          provider: string
          success: boolean
        }
        Insert: {
          attempt_no: number
          created_at?: string
          error_message?: string | null
          id?: string
          print_job_id: string
          provider: string
          success: boolean
        }
        Update: {
          attempt_no?: number
          created_at?: string
          error_message?: string | null
          id?: string
          print_job_id?: string
          provider?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "print_job_attempts_print_job_id_fkey"
            columns: ["print_job_id"]
            isOneToOne: false
            referencedRelation: "print_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      print_jobs: {
        Row: {
          attempts: number
          content_format: string
          created_at: string
          id: string
          idempotency_key: string
          last_error: string | null
          max_attempts: number
          order_id: string | null
          partner_id: string
          payload: Json
          printer_id: string
          scheduled_at: string
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          content_format?: string
          created_at?: string
          id?: string
          idempotency_key: string
          last_error?: string | null
          max_attempts?: number
          order_id?: string | null
          partner_id: string
          payload: Json
          printer_id: string
          scheduled_at?: string
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          content_format?: string
          created_at?: string
          id?: string
          idempotency_key?: string
          last_error?: string | null
          max_attempts?: number
          order_id?: string | null
          partner_id?: string
          payload?: Json
          printer_id?: string
          scheduled_at?: string
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "print_jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_jobs_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_jobs_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "partner_printers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_extras: {
        Row: {
          created_at: string
          default_price: number
          id: string
          image_url: string | null
          name: string
          partner_id: string
        }
        Insert: {
          created_at?: string
          default_price?: number
          id?: string
          image_url?: string | null
          name: string
          partner_id: string
        }
        Update: {
          created_at?: string
          default_price?: number
          id?: string
          image_url?: string | null
          name?: string
          partner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_extras_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      product_section_options: {
        Row: {
          created_at: string
          display_order: number
          extra_id: string
          id: string
          override_price: number | null
          section_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          extra_id: string
          id?: string
          override_price?: number | null
          section_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          extra_id?: string
          id?: string
          override_price?: number | null
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_section_options_extra_id_fkey"
            columns: ["extra_id"]
            isOneToOne: false
            referencedRelation: "product_extras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_section_options_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "product_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sections: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_required: boolean
          name: string
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_required?: boolean
          name: string
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_required?: boolean
          name?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tag_definitions: {
        Row: {
          color: string | null
          created_at: string | null
          icon_key: string
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon_key: string
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon_key?: string
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      product_tags: {
        Row: {
          created_at: string | null
          product_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          product_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "product_tag_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variant_groups: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_required: boolean
          name: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean
          name: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean
          name?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          base_price: number
          created_at: string | null
          group_id: string | null
          id: string
          is_available: boolean | null
          name: string
          product_id: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_available?: boolean | null
          name: string
          product_id: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_available?: boolean | null
          name?: string
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "product_variant_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category_id: string | null
          created_at: string
          description: string | null
          discount_percentage: number | null
          display_order: number
          estimated_time: string
          id: string
          image_url: string | null
          is_available: boolean
          measurement_unit: Database["public"]["Enums"]["measurement_unit_type"]
          min_quantity: number
          name: string
          partner_id: string
          previous_price: number | null
          quantity_step: number
          search_keywords: string[] | null
          sub_category_id: string | null
          tax_included: boolean
          unit: string
          updated_at: string
        }
        Insert: {
          base_price: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          display_order: number
          estimated_time: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          measurement_unit?: Database["public"]["Enums"]["measurement_unit_type"]
          min_quantity?: number
          name: string
          partner_id: string
          previous_price?: number | null
          quantity_step?: number
          search_keywords?: string[] | null
          sub_category_id?: string | null
          tax_included?: boolean
          unit: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          display_order?: number
          estimated_time?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          measurement_unit?: Database["public"]["Enums"]["measurement_unit_type"]
          min_quantity?: number
          name?: string
          partner_id?: string
          previous_price?: number | null
          quantity_step?: number
          search_keywords?: string[] | null
          sub_category_id?: string | null
          tax_included?: boolean
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "sub_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed_at: string | null
          phone_number: string | null
          role: Database["public"]["Enums"]["app_role"]
          selected_address: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed_at?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          selected_address?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed_at?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          selected_address?: string | null
        }
        Relationships: []
      }
      push_delivery_logs: {
        Row: {
          channel: string
          created_at: string
          delivery_status: string
          error_message: string | null
          id: number
          job_id: number
          provider_response: Json | null
          provider_status_code: number | null
          target: string
          user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          delivery_status: string
          error_message?: string | null
          id?: number
          job_id: number
          provider_response?: Json | null
          provider_status_code?: number | null
          target: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          delivery_status?: string
          error_message?: string | null
          id?: number
          job_id?: number
          provider_response?: Json | null
          provider_status_code?: number | null
          target?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_delivery_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "push_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_delivery_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_jobs: {
        Row: {
          attempt_count: number
          body: string
          channel: string
          created_at: string
          id: number
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          next_retry_at: string | null
          notification_id: number | null
          payload: Json | null
          sent_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_count?: number
          body: string
          channel?: string
          created_at?: string
          id?: number
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          notification_id?: number | null
          payload?: Json | null
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_count?: number
          body?: string
          channel?: string
          created_at?: string
          id?: number
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          notification_id?: number | null
          payload?: Json | null
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_jobs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          app_version: string | null
          created_at: string
          device_id: string | null
          id: string
          is_active: boolean
          last_seen_at: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          order_id: string
          partner_id: string
          rating_value: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id: string
          partner_id: string
          rating_value: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string
          partner_id?: string
          rating_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          average_rating: number | null
          cuisine_type: string | null
          has_outdoor_seating: boolean | null
          id: string
        }
        Insert: {
          average_rating?: number | null
          cuisine_type?: string | null
          has_outdoor_seating?: boolean | null
          id: string
        }
        Update: {
          average_rating?: number | null
          cuisine_type?: string | null
          has_outdoor_seating?: boolean | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_partner"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery_at: string | null
          actual_pickup_at: string | null
          created_at: string
          destination_coordinates: unknown
          distance_meters: number | null
          driver_id: string | null
          duration_seconds: number | null
          estimated_delivery_at: string | null
          estimated_pickup_at: string | null
          id: string
          order_id: string
          origin_coordinates: unknown
          route_details: Json | null
          shipping_cost: number | null
          status: Database["public"]["Enums"]["shipment_status"]
          updated_at: string
        }
        Insert: {
          actual_delivery_at?: string | null
          actual_pickup_at?: string | null
          created_at?: string
          destination_coordinates?: unknown
          distance_meters?: number | null
          driver_id?: string | null
          duration_seconds?: number | null
          estimated_delivery_at?: string | null
          estimated_pickup_at?: string | null
          id?: string
          order_id: string
          origin_coordinates?: unknown
          route_details?: Json | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["shipment_status"]
          updated_at?: string
        }
        Update: {
          actual_delivery_at?: string | null
          actual_pickup_at?: string | null
          created_at?: string
          destination_coordinates?: unknown
          distance_meters?: number | null
          driver_id?: string | null
          duration_seconds?: number | null
          estimated_delivery_at?: string | null
          estimated_pickup_at?: string | null
          id?: string
          order_id?: string
          origin_coordinates?: unknown
          route_details?: Json | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["shipment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "view_driver_balances"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      sub_categories: {
        Row: {
          category_id: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          name: string
          partner_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          display_order: number
          id?: string
          image_url?: string | null
          name?: string
          partner_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          name?: string
          partner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_partner"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      tobacco_shops: {
        Row: {
          id: string
          license_number: string | null
        }
        Insert: {
          id: string
          license_number?: string | null
        }
        Update: {
          id?: string
          license_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_partner"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          alias: string | null
          coordinates: unknown
          created_at: string
          deleted_at: string | null
          delivery_instructions: string | null
          delivery_preference: string | null
          id: string
          location_number: string
          location_type: Database["public"]["Enums"]["address_location_type"]
          sector: string | null
          user_id: string
        }
        Insert: {
          alias?: string | null
          coordinates?: unknown
          created_at?: string
          deleted_at?: string | null
          delivery_instructions?: string | null
          delivery_preference?: string | null
          id?: string
          location_number: string
          location_type: Database["public"]["Enums"]["address_location_type"]
          sector?: string | null
          user_id: string
        }
        Update: {
          alias?: string | null
          coordinates?: unknown
          created_at?: string
          deleted_at?: string | null
          delivery_instructions?: string | null
          delivery_preference?: string | null
          id?: string
          location_number?: string
          location_type?: Database["public"]["Enums"]["address_location_type"]
          sector?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_data_deletion_requests: {
        Row: {
          email: string
          id: number
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          requested_at: string
          requested_from: string
          resolution_notes: string | null
          status: string
          user_id: string
          validation_method: string
        }
        Insert: {
          email: string
          id?: number
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_at?: string
          requested_from?: string
          resolution_notes?: string | null
          status?: string
          user_id: string
          validation_method?: string
        }
        Update: {
          email?: string
          id?: number
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_at?: string
          requested_from?: string
          resolution_notes?: string | null
          status?: string
          user_id?: string
          validation_method?: string
        }
        Relationships: []
      }
      user_live_sessions: {
        Row: {
          app_version: string | null
          closed_at: string | null
          created_at: string
          device_id: string | null
          id: number
          last_seen_at: string
          opened_at: string
          platform: string
          session_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          closed_at?: string | null
          created_at?: string
          device_id?: string | null
          id?: number
          last_seen_at?: string
          opened_at?: string
          platform?: string
          session_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          closed_at?: string | null
          created_at?: string
          device_id?: string | null
          id?: number
          last_seen_at?: string
          opened_at?: string
          platform?: string
          session_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_payment_methods: {
        Row: {
          billing_provider: string
          brand: string
          cardholder_name: string | null
          created_at: string
          exp_month: number
          exp_year: number
          fingerprint: string | null
          id: string
          is_default: boolean
          last4: string
          payment_provider_token: string
          postal_code: string | null
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_provider?: string
          brand: string
          cardholder_name?: string | null
          created_at?: string
          exp_month: number
          exp_year: number
          fingerprint?: string | null
          id?: string
          is_default?: boolean
          last4: string
          payment_provider_token: string
          postal_code?: string | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_provider?: string
          brand?: string
          cardholder_name?: string | null
          created_at?: string
          exp_month?: number
          exp_year?: number
          fingerprint?: string | null
          id?: string
          is_default?: boolean
          last4?: string
          payment_provider_token?: string
          postal_code?: string | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      web_push_subscriptions: {
        Row: {
          app_version: string | null
          auth: string
          created_at: string
          device_id: string | null
          endpoint: string
          id: string
          is_active: boolean
          last_seen_at: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          app_version?: string | null
          auth: string
          created_at?: string
          device_id?: string | null
          endpoint: string
          id?: string
          is_active?: boolean
          last_seen_at?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          app_version?: string | null
          auth?: string
          created_at?: string
          device_id?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean
          last_seen_at?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "web_push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      view_driver_balances: {
        Row: {
          current_debt: number | null
          driver_id: string | null
          driver_name: string | null
          email: string | null
          last_transaction: string | null
          status: Database["public"]["Enums"]["driver_status"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      accept_order: {
        Args: { p_order_id: string; p_user_id: string }
        Returns: Json
      }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      admin_settle_driver_debt: {
        Args: { p_amount: number; p_driver_id: string; p_user_id: string }
        Returns: boolean
      }
      check_email_exists: { Args: { email_input: string }; Returns: boolean }
      complete_delivery_and_pay: {
        Args: {
          p_collected_method: Database["public"]["Enums"]["payment_method_type"]
          p_driver_id: string
          p_order_id: string
        }
        Returns: Json
      }
      complete_delivery_and_pay_v2: {
        Args: {
          p_allow_missing_payment_record?: boolean
          p_collected_method?: Database["public"]["Enums"]["payment_method_type"]
          p_driver_id?: string
          p_order_id: string
        }
        Returns: Json
      }
      complete_partner_profile: {
        Args: { partner_data: Json }
        Returns: undefined
      }
      confirm_delivery_with_pin: {
        Args: { p_order_id: string; p_pin: string; p_user_id: string }
        Returns: Json
      }
      create_guest_order_transaction: {
        Args: {
          p_cart_items: Json
          p_checkout_data: Json
          p_guest_details: Json
          p_guest_session_id: string
          p_guest_user_id: string
          p_partner_id: string
          p_session_first_name: string
          p_session_last_name: string
          p_session_phone: string
        }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_message: string
          p_metadata?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      create_order: {
        Args: { cart_items: Json; checkout_data: Json }
        Returns: string
      }
      create_order_v3: {
        Args: { cart_items: Json; checkout_data: Json }
        Returns: string
      }
      create_order_v4: {
        Args: { cart_items: Json; checkout_data: Json }
        Returns: string
      }
      create_order_v5: {
        Args: { cart_items: Json; checkout_data: Json }
        Returns: string
      }
      create_order_v6: {
        Args: { cart_items: Json; checkout_data: Json }
        Returns: string
      }
      create_order_v7: {
        Args: { cart_items: Json; checkout_data: Json }
        Returns: string
      }
      create_order_v8: {
        Args: { cart_items: Json; checkout_data: Json }
        Returns: string
      }
      create_order_v9: {
        Args: { cart_items: Json; checkout_data: Json }
        Returns: string
      }
      create_order_with_variants: {
        Args: { cart_items: Json; checkout_data: Json }
        Returns: string
      }
      create_order_with_variants_v2: {
        Args: { cart_items: Json; checkout_data: Json }
        Returns: string
      }
      disablelongtransactions: { Args: never; Returns: string }
      display_price: {
        Args: { product_row: Database["public"]["Tables"]["products"]["Row"] }
        Returns: number
      }
      display_variant_price: {
        Args: {
          variant_row: Database["public"]["Tables"]["product_variants"]["Row"]
        }
        Returns: number
      }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_customers_page: {
        Args: { page_number: number; page_size: number; search_query: string }
        Returns: {
          created_at: string
          fullname: string
          id: string
          phone: string
          total_amount: number
          total_records: number
        }[]
      }
      get_guest_fixed_store_id: { Args: never; Returns: string }
      get_guest_order_tracking: {
        Args: { p_phone_e164?: string; p_tracking_token: string }
        Returns: {
          amount_total: number
          created_at: string
          currency: string
          customer_first_name: string
          customer_last_name: string
          customer_phone_last4: string
          expires_at: string
          order_id: string
          order_status_snapshot: string
          payment_status: string
        }[]
      }
      get_live_users_count: {
        Args: { p_window_seconds?: number }
        Returns: number
      }
      get_map_partners: { Args: never; Returns: Json }
      get_partner_details: {
        Args: { p_id: string }
        Returns: {
          address: string
          coordinates: Json
        }[]
      }
      get_partners: {
        Args: {
          filter_state: string
          filter_type: string
          page_num: number
          page_size: number
          search_query: string
          sort_by: string
          sort_order: string
        }
        Returns: {
          address: string
          id: string
          imageUrl: string
          isActive: boolean
          isApproved: boolean
          name: string
          nit: string
          state: string
          totalOrders: number
          type: string
        }[]
      }
      get_similar_products: {
        Args: { p_limit?: number; p_target_product_id: string }
        Returns: {
          base_price: number
          category_id: string | null
          created_at: string
          description: string | null
          discount_percentage: number | null
          display_order: number
          estimated_time: string
          id: string
          image_url: string | null
          is_available: boolean
          measurement_unit: Database["public"]["Enums"]["measurement_unit_type"]
          min_quantity: number
          name: string
          partner_id: string
          previous_price: number | null
          quantity_step: number
          search_keywords: string[] | null
          sub_category_id: string | null
          tax_included: boolean
          unit: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_address_details: {
        Args: { addr_id: string }
        Returns: {
          coordinates: Json
          location_number: string
          location_type: string
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      guest_chat_list: {
        Args: {
          p_before_created_at?: string
          p_before_id?: string
          p_limit?: number
          p_phone_e164?: string
          p_tracking_token: string
        }
        Returns: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          metadata: Json
          order_id: string
          sender_profile_id: string
          sender_role: string
        }[]
      }
      guest_chat_send: {
        Args: {
          p_content: string
          p_message_type?: string
          p_phone_e164?: string
          p_tracking_token: string
        }
        Returns: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          metadata: Json
          order_id: string
          sender_profile_id: string
          sender_role: string
        }[]
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      mark_delivery_as_complete: {
        Args: { caller_user_id_param: string; order_id_param: string }
        Returns: string
      }
      normalize_partner_product_order: {
        Args: { p_partner_id: string; p_sub_category_id?: string }
        Returns: undefined
      }
      normalize_partner_sub_category_order: {
        Args: { p_partner_id: string }
        Returns: undefined
      }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      register_live_session_heartbeat: {
        Args: {
          p_app_version?: string
          p_last_seen_at?: string
          p_platform?: string
          p_session_id: string
          p_status?: string
        }
        Returns: undefined
      }
      register_partner: {
        Args: { email: string; partner_data: Json; password: string }
        Returns: string
      }
      register_push_token: {
        Args: {
          p_app_version?: string
          p_device_id?: string
          p_last_seen_at?: string
          p_platform: string
          p_token: string
        }
        Returns: undefined
      }
      register_web_push_subscription: {
        Args: {
          p_app_version?: string
          p_auth: string
          p_device_id?: string
          p_endpoint: string
          p_last_seen_at?: string
          p_p256dh: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      reorder_partner_products: {
        Args: {
          p_items: Json
          p_partner_id: string
          p_sub_category_id?: string
        }
        Returns: undefined
      }
      reorder_partner_sub_categories: {
        Args: { p_items: Json; p_partner_id: string }
        Returns: undefined
      }
      resolve_guest_session: {
        Args: { p_session_token: string; p_store_id?: string }
        Returns: {
          expires_at: string
          first_name: string
          guest_session_id: string
          is_valid: boolean
          last_name: string
          phone_last4: string
          store_id: string
        }[]
      }
      search_products_custom: {
        Args: { search_term: string }
        Returns: {
          base_price: number
          category_id: string | null
          created_at: string
          description: string | null
          discount_percentage: number | null
          display_order: number
          estimated_time: string
          id: string
          image_url: string | null
          is_available: boolean
          measurement_unit: Database["public"]["Enums"]["measurement_unit_type"]
          min_quantity: number
          name: string
          partner_id: string
          previous_price: number | null
          quantity_step: number
          search_keywords: string[] | null
          sub_category_id: string | null
          tax_included: boolean
          unit: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      address_location_type:
        | "villa"
        | "yate"
        | "piscina"
        | "habitacion de hotel"
        | "muelle de yate"
      app_role: "user" | "admin" | "market" | "restaurant" | "delivery"
      app_section_key:
        | "home_recommended_carousel"
        | "market_list"
        | "restaurant_list"
        | "pharmacy_list"
        | "liquor_list"
      banner_placement:
        | "home_top"
        | "search_page"
        | "test_page"
        | "yacht_section"
      coupon_discount_type: "percentage" | "fixed_amount"
      coupon_status: "active" | "inactive" | "expired"
      driver_status:
        | "offline"
        | "online"
        | "in_delivery"
        | "pending_approval"
        | "inactive"
      measurement_unit_type: "unit" | "lb" | "kg" | "oz" | "g"
      order_status:
        | "awaiting_payment"
        | "pending"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "payment_failed"
      partner_type:
        | "market"
        | "restaurant"
        | "liquor_store"
        | "pharmacy"
        | "tobacco"
      payment_method_type: "cash" | "physical_pos" | "online_gateway"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      shipment_status:
        | "pending_calculation"
        | "ready_for_pickup"
        | "driver_assigned"
        | "en_route_to_pickup"
        | "at_partner"
        | "en_route_to_delivery"
        | "at_destination"
        | "delivered"
        | "cancelled"
        | "failed"
      vehicle_type: "motorcycle" | "car" | "bicycle" | "walking"
    }
    CompositeTypes: {
      cart_extra_type: {
        extraId: string | null
        quantity: number | null
        price: number | null
      }
      cart_item_type: {
        productId: string | null
        partnerId: string | null
        unitPrice: number | null
        quantity: number | null
        note: string | null
        extras: Json | null
      }
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
      address_location_type: [
        "villa",
        "yate",
        "piscina",
        "habitacion de hotel",
        "muelle de yate",
      ],
      app_role: ["user", "admin", "market", "restaurant", "delivery"],
      app_section_key: [
        "home_recommended_carousel",
        "market_list",
        "restaurant_list",
        "pharmacy_list",
        "liquor_list",
      ],
      banner_placement: [
        "home_top",
        "search_page",
        "test_page",
        "yacht_section",
      ],
      coupon_discount_type: ["percentage", "fixed_amount"],
      coupon_status: ["active", "inactive", "expired"],
      driver_status: [
        "offline",
        "online",
        "in_delivery",
        "pending_approval",
        "inactive",
      ],
      measurement_unit_type: ["unit", "lb", "kg", "oz", "g"],
      order_status: [
        "awaiting_payment",
        "pending",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "payment_failed",
      ],
      partner_type: [
        "market",
        "restaurant",
        "liquor_store",
        "pharmacy",
        "tobacco",
      ],
      payment_method_type: ["cash", "physical_pos", "online_gateway"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      shipment_status: [
        "pending_calculation",
        "ready_for_pickup",
        "driver_assigned",
        "en_route_to_pickup",
        "at_partner",
        "en_route_to_delivery",
        "at_destination",
        "delivered",
        "cancelled",
        "failed",
      ],
      vehicle_type: ["motorcycle", "car", "bicycle", "walking"],
    },
  },
} as const
