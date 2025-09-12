import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Safe, lazy Supabase client factory to avoid runtime crashes when keys are missing.
// Keys can be provided via window.SUPABASE_URL / window.SUPABASE_ANON_KEY or localStorage.

declare global {
  interface Window {
    SUPABASE_URL?: string
    SUPABASE_ANON_KEY?: string
  }
}

let _client: SupabaseClient | null = null

const getFromStorage = (key: string) => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(key) || undefined : undefined
  } catch {
    return undefined
  }
}

function getKeys() {
  const supabaseUrl = (typeof window !== 'undefined' && (window.SUPABASE_URL || getFromStorage('supabaseUrl'))) || ''
  const supabaseAnonKey = (typeof window !== 'undefined' && (window.SUPABASE_ANON_KEY || getFromStorage('supabaseAnonKey'))) || ''
  return { supabaseUrl, supabaseAnonKey }
}

export function isSupabaseConfigured() {
  const { supabaseUrl, supabaseAnonKey } = getKeys()
  return Boolean(supabaseUrl && supabaseAnonKey)
}

export function getSupabase(): SupabaseClient | null {
  const { supabaseUrl, supabaseAnonKey } = getKeys()
  if (!supabaseUrl || !supabaseAnonKey) return null
  if (_client) return _client
  _client = createClient(supabaseUrl, supabaseAnonKey)
  return _client
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          department: 'Marketing' | 'IT' | 'Support' | 'Finance' | 'HR'
          status: 'Available' | 'Away' | 'Busy'
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          department: 'Marketing' | 'IT' | 'Support' | 'Finance' | 'HR'
          status?: 'Available' | 'Away' | 'Busy'
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          department?: 'Marketing' | 'IT' | 'Support' | 'Finance' | 'HR'
          status?: 'Available' | 'Away' | 'Busy'
          created_at?: string
        }
      }
      timesheets: {
        Row: {
          id: string
          user_id: string
          date: string
          category: 'Support' | 'Project' | 'Meeting' | 'Training' | 'Other'
          task: string
          hours: number
          notes?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          category: 'Support' | 'Project' | 'Meeting' | 'Training' | 'Other'
          task: string
          hours: number
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          category?: 'Support' | 'Project' | 'Meeting' | 'Training' | 'Other'
          task?: string
          hours?: number
          notes?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          status: 'To Do' | 'In Progress' | 'Done'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          status?: 'To Do' | 'In Progress' | 'Done'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          status?: 'To Do' | 'In Progress' | 'Done'
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          created_at?: string
        }
      }
      quick_notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          status: 'finished' | 'unfinished'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          status?: 'finished' | 'unfinished'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          status?: 'finished' | 'unfinished'
          created_at?: string
          updated_at?: string
        }
      }
      faq: {
        Row: {
          id: string
          question: string
          answer: string
          related_page?: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          related_page?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          related_page?: string
        }
      }
    }
  }
}
