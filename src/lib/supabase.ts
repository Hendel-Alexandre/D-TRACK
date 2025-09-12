import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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