export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string;
          id: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      deliveries: {
        Row: {
          created_at: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      liquor_stores: {
        Row: {
          id: string;
          license_number: string;
          specializes_in: string | null;
        };
        Insert: {
          id: string;
          license_number: string;
          specializes_in?: string | null;
        };
        Update: {
          id?: string;
          license_number?: string;
          specializes_in?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_partner";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          }
        ];
      };
      markets: {
        Row: {
          has_bakery: boolean | null;
          has_butchery: boolean | null;
          id: string;
        };
        Insert: {
          has_bakery?: boolean | null;
          has_butchery?: boolean | null;
          id: string;
        };
        Update: {
          has_bakery?: boolean | null;
          has_butchery?: boolean | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_partner";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          }
        ];
      };
      normal_users: {
        Row: {
          created_at: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      order_detail: {
        Row: {
          created_at: string;
          id: string;
          order_id: string | null;
          product_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_detail_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_detail_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      order_detail_extras: {
        Row: {
          created_at: string;
          id: string;
          product_detail: string | null;
          product_extra_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_detail?: string | null;
          product_extra_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_detail?: string | null;
          product_extra_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_detail_extras_product_detail_fkey";
            columns: ["product_detail"];
            isOneToOne: false;
            referencedRelation: "order_detail";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          created_at: string;
          id: string;
          partner_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          partner_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          partner_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_partner";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          }
        ];
      };
      partners: {
        Row: {
          address: string | null;
          approved_at: string | null;
          approved_by: string | null;
          bank_account_number: string | null;
          bank_account_type: string | null;
          bank_document_url: string | null;
          bank_holder_name: string | null;
          bank_rnc: string | null;
          billing_email: string | null;
          business_hours: Json | null;
          conditions_accepted: boolean | null;
          created_at: string;
          id: string;
          image_url: string | null;
          is_approved: boolean;
          is_physical: boolean | null;
          name: string;
          partner_type: Database["public"]["Enums"]["partner_type"];
          phone: string;
          user_id: string;
          user_rnc: string;
        };
        Insert: {
          address?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          bank_account_number?: string | null;
          bank_account_type?: string | null;
          bank_document_url?: string | null;
          bank_holder_name?: string | null;
          bank_rnc?: string | null;
          billing_email?: string | null;
          business_hours?: Json | null;
          conditions_accepted?: boolean | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_approved?: boolean;
          is_physical?: boolean | null;
          name: string;
          partner_type: Database["public"]["Enums"]["partner_type"];
          phone: string;
          user_id: string;
          user_rnc: string;
        };
        Update: {
          address?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          bank_account_number?: string | null;
          bank_account_type?: string | null;
          bank_document_url?: string | null;
          bank_holder_name?: string | null;
          bank_rnc?: string | null;
          billing_email?: string | null;
          business_hours?: Json | null;
          conditions_accepted?: boolean | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_approved?: boolean;
          is_physical?: boolean | null;
          name?: string;
          partner_type?: Database["public"]["Enums"]["partner_type"];
          phone?: string;
          user_id?: string;
          user_rnc?: string;
        };
        Relationships: [
          {
            foreignKeyName: "partners_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "admins";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "partners_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      persons: {
        Row: {
          created_at: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      product_extras: {
        Row: {
          created_at: string;
          default_price: number;
          id: string;
          image_url: string | null;
          name: string;
          partner_id: string;
        };
        Insert: {
          created_at?: string;
          default_price?: number;
          id?: string;
          image_url?: string | null;
          name: string;
          partner_id: string;
        };
        Update: {
          created_at?: string;
          default_price?: number;
          id?: string;
          image_url?: string | null;
          name?: string;
          partner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_extras_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          }
        ];
      };
      product_section_options: {
        Row: {
          created_at: string;
          display_order: number;
          extra_id: string;
          id: string;
          override_price: number | null;
          section_id: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          extra_id: string;
          id?: string;
          override_price?: number | null;
          section_id: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          extra_id?: string;
          id?: string;
          override_price?: number | null;
          section_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_section_options_extra_id_fkey";
            columns: ["extra_id"];
            isOneToOne: false;
            referencedRelation: "product_extras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_section_options_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "product_sections";
            referencedColumns: ["id"];
          }
        ];
      };
      product_sections: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          is_required: boolean;
          name: string;
          product_id: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          is_required?: boolean;
          name: string;
          product_id: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          is_required?: boolean;
          name?: string;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_sections_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          base_price: number;
          created_at: string;
          description: string | null;
          discount_percentage: number | null;
          estimated_time: string;
          id: string;
          image_url: string | null;
          is_available: boolean;
          name: string;
          partner_id: string;
          previous_price: number | null;
          sub_category_id: string;
          tax_included: boolean;
          unit: string;
          updated_at: string;
        };
        Insert: {
          base_price: number;
          created_at?: string;
          description?: string | null;
          discount_percentage?: number | null;
          estimated_time: string;
          id?: string;
          image_url?: string | null;
          is_available?: boolean;
          name: string;
          partner_id: string;
          previous_price?: number | null;
          sub_category_id: string;
          tax_included?: boolean;
          unit: string;
          updated_at?: string;
        };
        Update: {
          base_price?: number;
          created_at?: string;
          description?: string | null;
          discount_percentage?: number | null;
          estimated_time?: string;
          id?: string;
          image_url?: string | null;
          is_available?: boolean;
          name?: string;
          partner_id?: string;
          previous_price?: number | null;
          sub_category_id?: string;
          tax_included?: boolean;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_sub_category_id_fkey";
            columns: ["sub_category_id"];
            isOneToOne: false;
            referencedRelation: "sub_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          selected_address: string | null;
        };
        Insert: {
          id: string;
          role?: Database["public"]["Enums"]["app_role"];
          selected_address?: string | null;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          selected_address?: string | null;
        };
        Relationships: [];
      };
      restaurants: {
        Row: {
          average_rating: number | null;
          cuisine_type: string | null;
          has_outdoor_seating: boolean | null;
          id: string;
        };
        Insert: {
          average_rating?: number | null;
          cuisine_type?: string | null;
          has_outdoor_seating?: boolean | null;
          id: string;
        };
        Update: {
          average_rating?: number | null;
          cuisine_type?: string | null;
          has_outdoor_seating?: boolean | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_partner";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          }
        ];
      };
      sub_categories: {
        Row: {
          category_id: string | null;
          created_at: string;
          id: string;
          name: string;
          partner_id: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          partner_id: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          partner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_category";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_partner";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          }
        ];
      };
      user_addresses: {
        Row: {
          created_at: string;
          id: string;
          location_number: string;
          location_type: Database["public"]["Enums"]["address_location_type"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          location_number: string;
          location_type: Database["public"]["Enums"]["address_location_type"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          location_number?: string;
          location_type?: Database["public"]["Enums"]["address_location_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      complete_partner_profile: {
        Args: { partner_data: Json; user_id: string };
        Returns: undefined;
      };
      get_partners: {
        Args: {
          filter_state: string;
          filter_type: string;
          page_num: number;
          page_size: number;
          search_query: string;
          sort_by: string;
          sort_order: string;
        };
        Returns: {
          address: string;
          id: string;
          imageurl: string;
          name: string;
          nit: string;
          state: string;
          totalorders: number;
          type: string;
        }[];
      };
      register_partner: {
        Args: { email: string; partner_data: Json; password: string };
        Returns: string;
      };
    };
    Enums: {
      address_location_type: "villa" | "yate";
      app_role: "user" | "admin" | "market" | "restaurant" | "delivery";
      partner_type: "market" | "restaurant" | "liquor_store";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      address_location_type: ["villa", "yate"],
      app_role: ["user", "admin", "market", "restaurant", "delivery"],
      partner_type: ["market", "restaurant", "liquor_store"],
    },
  },
} as const;
