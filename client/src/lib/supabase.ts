import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = 
    !!supabaseUrl && 
    supabaseUrl !== "https://tu-proyecto.supabase.co" && 
    !!supabaseAnonKey && 
    supabaseAnonKey !== "tu-anon-key-aqui";

if (!isSupabaseConfigured) {
    console.error("CRÍTICO: No se encontró una configuración válida de Supabase en .env");
}

export const supabase = createClient<Database>(
    supabaseUrl || "https://placeholder.supabase.co", 
    supabaseAnonKey || "placeholder"
);
