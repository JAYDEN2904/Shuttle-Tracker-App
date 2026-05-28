export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "student" | "driver" | "admin";
export type CapacityStatus = "available" | "half_full" | "full";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: UserRole;
          employee_id: string | null;
          avatar_url: string | null;
          expo_push_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role: UserRole;
          employee_id?: string | null;
          avatar_url?: string | null;
          expo_push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: UserRole;
          employee_id?: string | null;
          avatar_url?: string | null;
          expo_push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      routes: {
        Row: {
          id: string;
          name: string;
          code: string;
          color: string;
          is_active: boolean;
          operating_start: string;
          operating_end: string;
          frequency_peak_mins: number | null;
          frequency_offpeak_mins: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          color?: string;
          is_active?: boolean;
          operating_start?: string;
          operating_end?: string;
          frequency_peak_mins?: number | null;
          frequency_offpeak_mins?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          color?: string;
          is_active?: boolean;
          operating_start?: string;
          operating_end?: string;
          frequency_peak_mins?: number | null;
          frequency_offpeak_mins?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      stops: {
        Row: {
          id: string;
          route_id: string;
          name: string;
          lat: number;
          lng: number;
          sequence_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          name: string;
          lat: number;
          lng: number;
          sequence_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          name?: string;
          lat?: number;
          lng?: number;
          sequence_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stops_route_id_fkey";
            columns: ["route_id"];
            isOneToOne: false;
            referencedRelation: "routes";
            referencedColumns: ["id"];
          },
        ];
      };
      shuttles: {
        Row: {
          id: string;
          driver_id: string | null;
          route_id: string | null;
          plate_number: string | null;
          capacity_status: CapacityStatus;
          is_live: boolean;
          trip_started_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          driver_id?: string | null;
          route_id?: string | null;
          plate_number?: string | null;
          capacity_status?: CapacityStatus;
          is_live?: boolean;
          trip_started_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string | null;
          route_id?: string | null;
          plate_number?: string | null;
          capacity_status?: CapacityStatus;
          is_live?: boolean;
          trip_started_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shuttles_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shuttles_route_id_fkey";
            columns: ["route_id"];
            isOneToOne: false;
            referencedRelation: "routes";
            referencedColumns: ["id"];
          },
        ];
      };
      shuttle_locations: {
        Row: {
          shuttle_id: string;
          lat: number;
          lng: number;
          heading: number | null;
          speed_kmh: number | null;
          updated_at: string;
        };
        Insert: {
          shuttle_id: string;
          lat: number;
          lng: number;
          heading?: number | null;
          speed_kmh?: number | null;
          updated_at?: string;
        };
        Update: {
          shuttle_id?: string;
          lat?: number;
          lng?: number;
          heading?: number | null;
          speed_kmh?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shuttle_locations_shuttle_id_fkey";
            columns: ["shuttle_id"];
            isOneToOne: true;
            referencedRelation: "shuttles";
            referencedColumns: ["id"];
          },
        ];
      };
      trips: {
        Row: {
          id: string;
          shuttle_id: string | null;
          route_id: string | null;
          driver_id: string | null;
          started_at: string;
          ended_at: string | null;
          distance_km: number | null;
        };
        Insert: {
          id?: string;
          shuttle_id?: string | null;
          route_id?: string | null;
          driver_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          distance_km?: number | null;
        };
        Update: {
          id?: string;
          shuttle_id?: string | null;
          route_id?: string | null;
          driver_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          distance_km?: number | null;
        };
        Relationships: [];
      };
      stop_alerts: {
        Row: {
          id: string;
          student_id: string;
          stop_id: string;
          shuttle_id: string;
          notify_at: string;
          is_sent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          stop_id: string;
          shuttle_id: string;
          notify_at: string;
          is_sent?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          stop_id?: string;
          shuttle_id?: string;
          notify_at?: string;
          is_sent?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_driver_email: {
        Args: { p_employee_id: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Route = Database["public"]["Tables"]["routes"]["Row"];
export type Stop = Database["public"]["Tables"]["stops"]["Row"];
export type Shuttle = Database["public"]["Tables"]["shuttles"]["Row"];
export type ShuttleLocation =
  Database["public"]["Tables"]["shuttle_locations"]["Row"];
export type Trip = Database["public"]["Tables"]["trips"]["Row"];
export type StopAlert = Database["public"]["Tables"]["stop_alerts"]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type TablesRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
