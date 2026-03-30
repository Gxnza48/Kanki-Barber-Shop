export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            services: {
                Row: {
                    id: number
                    name: string
                    description: string
                    price: number
                    duration: number
                    image_url: string | null
                }
                Insert: {
                    id?: number
                    name: string
                    description: string
                    price: number
                    duration: number
                    image_url?: string | null
                }
                Update: {
                    id?: number
                    name?: string
                    description?: string
                    price?: number
                    duration?: number
                    image_url?: string | null
                }
            }
            appointments: {
                Row: {
                    id: number
                    client_name: string
                    client_whatsapp: string
                    service_id: number
                    date: string
                    time: string
                    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
                    created_at: string | null
                }
                Insert: {
                    id?: number
                    client_name: string
                    client_whatsapp: string
                    service_id: number
                    date: string
                    time: string
                    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
                    created_at?: string | null
                }
                Update: {
                    id?: number
                    client_name?: string
                    client_whatsapp?: string
                    service_id?: number
                    date?: string
                    time?: string
                    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
                    created_at?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Tipos de conveniencia
export type Service = Database['public']['Tables']['services']['Row'];
export type InsertService = Database['public']['Tables']['services']['Insert'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type InsertAppointment = Database['public']['Tables']['appointments']['Insert'];
