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
      client_access: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          business_name: string
          client_type: string
          contact_name: string
          created_at: string
          email: string
          id: string
          last_active: string | null
          phone: string | null
          portal_access: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          client_type: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          last_active?: string | null
          phone?: string | null
          portal_access?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          client_type?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          last_active?: string | null
          phone?: string | null
          portal_access?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      customer_communications: {
        Row: {
          communication_type: string
          completed_date: string | null
          content: string
          created_at: string | null
          created_by: string | null
          customer_id: string
          id: string
          scheduled_date: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          communication_type: string
          completed_date?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          id?: string
          scheduled_date?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          communication_type?: string
          completed_date?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          id?: string
          scheduled_date?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_communications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_statements: {
        Row: {
          closing_balance: number | null
          created_at: string | null
          customer_id: string
          from_date: string
          id: string
          opening_balance: number | null
          sent_at: string | null
          statement_date: string
          status: string | null
          to_date: string
          total_charges: number | null
          total_payments: number | null
        }
        Insert: {
          closing_balance?: number | null
          created_at?: string | null
          customer_id: string
          from_date: string
          id?: string
          opening_balance?: number | null
          sent_at?: string | null
          statement_date: string
          status?: string | null
          to_date: string
          total_charges?: number | null
          total_payments?: number | null
        }
        Update: {
          closing_balance?: number | null
          created_at?: string | null
          customer_id?: string
          from_date?: string
          id?: string
          opening_balance?: number | null
          sent_at?: string | null
          statement_date?: string
          status?: string | null
          to_date?: string
          total_charges?: number | null
          total_payments?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_statements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          credit_limit: number | null
          current_balance: number | null
          customer_code: string
          customer_type: string | null
          discount_percentage: number | null
          email: string | null
          id: string
          name: string
          payment_terms_days: number | null
          phone: string | null
          postal_code: string | null
          state: string | null
          status: string | null
          tax_exempt: boolean | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          customer_code: string
          customer_type?: string | null
          discount_percentage?: number | null
          email?: string | null
          id?: string
          name: string
          payment_terms_days?: number | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          status?: string | null
          tax_exempt?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          customer_code?: string
          customer_type?: string | null
          discount_percentage?: number | null
          email?: string | null
          id?: string
          name?: string
          payment_terms_days?: number | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          status?: string | null
          tax_exempt?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          active: boolean | null
          category: string | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          expiry_tracking: boolean | null
          id: string
          item_code: string
          name: string
          reorder_level: number | null
          reorder_quantity: number | null
          selling_price: number | null
          track_lots: boolean | null
          track_serials: boolean | null
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          expiry_tracking?: boolean | null
          id?: string
          item_code: string
          name: string
          reorder_level?: number | null
          reorder_quantity?: number | null
          selling_price?: number | null
          track_lots?: boolean | null
          track_serials?: boolean | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          expiry_tracking?: boolean | null
          id?: string
          item_code?: string
          name?: string
          reorder_level?: number | null
          reorder_quantity?: number | null
          selling_price?: number | null
          track_lots?: boolean | null
          track_serials?: boolean | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_locations: {
        Row: {
          active: boolean | null
          address: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_serials: {
        Row: {
          created_at: string | null
          expiry_date: string | null
          id: string
          item_id: string
          location_id: string
          lot_number: string | null
          quantity: number | null
          serial_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          item_id: string
          location_id: string
          lot_number?: string | null
          quantity?: number | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          item_id?: string
          location_id?: string
          lot_number?: string | null
          quantity?: number | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_serials_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_serials_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock: {
        Row: {
          id: string
          item_id: string
          last_updated: string | null
          location_id: string
          quantity_available: number | null
          quantity_on_hand: number | null
          quantity_reserved: number | null
        }
        Insert: {
          id?: string
          item_id: string
          last_updated?: string | null
          location_id: string
          quantity_available?: number | null
          quantity_on_hand?: number | null
          quantity_reserved?: number | null
        }
        Update: {
          id?: string
          item_id?: string
          last_updated?: string | null
          location_id?: string
          quantity_available?: number | null
          quantity_on_hand?: number | null
          quantity_reserved?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean | null
          created_at: string | null
          full_name: string | null
          id: string
          last_active: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          full_name?: string | null
          id: string
          last_active?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          last_active?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          po_id: string
          quantity_ordered: number
          quantity_received: number | null
          total_cost: number | null
          unit_cost: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          po_id: string
          quantity_ordered: number
          quantity_received?: number | null
          total_cost?: number | null
          unit_cost: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          po_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          total_cost?: number | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          created_by: string | null
          expected_delivery_date: string | null
          id: string
          location_id: string
          notes: string | null
          order_date: string
          po_number: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          location_id: string
          notes?: string | null
          order_date?: string
          po_number: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          location_id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          payment_terms_days: number | null
          phone: string | null
          postal_code: string | null
          state: string | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
          vendor_code: string
          vendor_type: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          payment_terms_days?: number | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          vendor_code: string
          vendor_type?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          payment_terms_days?: number | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          vendor_code?: string
          vendor_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_client_user: {
        Args: {
          p_address?: string
          p_business_name: string
          p_client_type: string
          p_contact_name: string
          p_email: string
          p_phone?: string
        }
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      user_has_role: {
        Args: { role_name: string; user_id: string }
        Returns: boolean
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
