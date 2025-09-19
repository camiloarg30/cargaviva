import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Always use the full Supabase URL - CORS will be handled by Supabase settings
const clientUrl = supabaseUrl

console.log('Config: Supabase client config:', {
  mode: import.meta.env.MODE,
  url: clientUrl,
  keyLength: supabaseAnonKey?.length
})

export const supabase = createClient(clientUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

console.log('Config: Supabase client initialized:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  supabase: !!supabase
})

// Type definitions
export type VehicleInfo = {
  type: string
  capacity_kg: number
  license_plate: string
  model?: string
  year?: number
}

export type Dimensions = {
  length_cm: number
  width_cm: number
  height_cm: number
}

export type NotificationPayload = {
  title: string
  message: string
  data?: Record<string, unknown>
}

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          role: 'generator' | 'transporter'
          name: string
          email: string | null
          phone: string | null
          company_name: string | null
          vehicle_info: VehicleInfo | null
          created_at: string
        }
        Insert: {
          id?: string
          role: 'generator' | 'transporter'
          name: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          vehicle_info?: VehicleInfo | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'generator' | 'transporter'
          name?: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          vehicle_info?: VehicleInfo | null
          created_at?: string
        }
      }
      cargas: {
        Row: {
          id: string
          generador_id: string
          origen: string
          destino: string
          tipo_mercancia: string
          peso_kg: number
          dimensiones: Dimensions | null
          fecha_requerida: string
          estado: 'published' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          generador_id: string
          origen: string
          destino: string
          tipo_mercancia: string
          peso_kg: number
          dimensiones?: Dimensions | null
          fecha_requerida: string
          estado?: 'published' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          generador_id?: string
          origen?: string
          destino?: string
          tipo_mercancia?: string
          peso_kg?: number
          dimensiones?: Dimensions | null
          fecha_requerida?: string
          estado?: 'published' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
          created_at?: string
        }
      }
      asignaciones: {
        Row: {
          id: string
          carga_id: string
          transportista_id: string
          tarifa: number | null
          estado: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
          accepted_at: string | null
        }
        Insert: {
          id?: string
          carga_id: string
          transportista_id: string
          tarifa?: number | null
          estado?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
          accepted_at?: string | null
        }
        Update: {
          id?: string
          carga_id?: string
          transportista_id?: string
          tarifa?: number | null
          estado?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
          accepted_at?: string | null
        }
      }
      documentos: {
        Row: {
          id: string
          carga_id: string
          tipo: string
          storage_path: string
          uploaded_by: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          carga_id: string
          tipo: string
          storage_path: string
          uploaded_by: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          carga_id?: string
          tipo?: string
          storage_path?: string
          uploaded_by?: string
          uploaded_at?: string
        }
      }
      notificaciones: {
        Row: {
          id: string
          user_id: string
          canal: 'whatsapp' | 'telegram' | 'email' | 'in_app'
          template: string
          payload: NotificationPayload
          sent_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          canal: 'whatsapp' | 'telegram' | 'email' | 'in_app'
          template: string
          payload: NotificationPayload
          sent_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          canal?: 'whatsapp' | 'telegram' | 'email' | 'in_app'
          template?: string
          payload?: NotificationPayload
          sent_at?: string | null
        }
      }
    }
  }
}