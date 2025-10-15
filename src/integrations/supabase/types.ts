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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_usage_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          token_count: number | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          token_count?: number | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          token_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_members: {
        Row: {
          added_at: string
          conversation_id: string
          id: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          added_at?: string
          conversation_id: string
          id?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          added_at?: string
          conversation_id?: string
          id?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_group: boolean
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      darvis_chats: {
        Row: {
          content: string
          created_at: string | null
          files: Json | null
          id: string
          images: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          files?: Json | null
          id?: string
          images?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          files?: Json | null
          id?: string
          images?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      enterprise_inquiries: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_moves: {
        Row: {
          created_at: string
          id: string
          move_data: Json
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          move_data: Json
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          move_data?: Json
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_moves_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      game_room_members: {
        Row: {
          id: string
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rooms: {
        Row: {
          created_at: string
          game_name: string
          game_state: Json | null
          host_id: string
          id: string
          room_code: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_name: string
          game_state?: Json | null
          host_id: string
          id?: string
          room_code: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_name?: string
          game_state?: Json | null
          host_id?: string
          id?: string
          room_code?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          created_at: string
          game_name: string
          id: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_name: string
          id?: string
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_name?: string
          id?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      history_logs: {
        Row: {
          action: string
          category: string
          created_at: string
          details: Json | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          category: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          category?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      hour_adjustments: {
        Row: {
          created_at: string
          date: string
          hours: number
          id: string
          notes: string | null
          reason: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          hours: number
          id?: string
          notes?: string | null
          reason: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          hours?: number
          id?: string
          notes?: string | null
          reason?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          delivered_at: string | null
          id: string
          message: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      note_notifications: {
        Row: {
          created_at: string
          id: string
          note_content: string | null
          note_id: string
          note_title: string
          recipient_id: string
          sender_id: string
          sender_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          note_content?: string | null
          note_id: string
          note_title: string
          recipient_id: string
          sender_id: string
          sender_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          note_content?: string | null
          note_id?: string
          note_title?: string
          recipient_id?: string
          sender_id?: string
          sender_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_profiles: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          selected_mode: string
          selected_plan: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          selected_mode: string
          selected_plan: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          selected_mode?: string
          selected_plan?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_assignments: {
        Row: {
          class_id: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          reminder_enabled: boolean | null
          reminder_hours_before: number | null
          status: Database["public"]["Enums"]["assignment_status"]
          title: string
          type: Database["public"]["Enums"]["assignment_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          status?: Database["public"]["Enums"]["assignment_status"]
          title: string
          type?: Database["public"]["Enums"]["assignment_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          status?: Database["public"]["Enums"]["assignment_status"]
          title?: string
          type?: Database["public"]["Enums"]["assignment_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "student_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_classes: {
        Row: {
          color: string | null
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          instructor: string | null
          location: string | null
          name: string
          start_time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          instructor?: string | null
          location?: string | null
          name: string
          start_time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          instructor?: string | null
          location?: string | null
          name?: string
          start_time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      student_conversation_members: {
        Row: {
          added_at: string | null
          conversation_id: string
          id: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          conversation_id: string
          id?: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          conversation_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "student_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      student_conversations: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          is_group: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          is_group?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      student_files: {
        Row: {
          assignment_id: string | null
          class_id: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          assignment_id?: string | null
          class_id?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          assignment_id?: string | null
          class_id?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_files_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "student_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_files_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "student_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "student_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          created_at: string | null
          id: string
          major: string | null
          school_name: string | null
          updated_at: string | null
          user_id: string
          year: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          major?: string | null
          school_name?: string | null
          updated_at?: string | null
          user_id: string
          year?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          major?: string | null
          school_name?: string | null
          updated_at?: string | null
          user_id?: string
          year?: string | null
        }
        Relationships: []
      }
      student_tasks: {
        Row: {
          assignment_id: string | null
          class_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignment_id?: string | null
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string | null
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_tasks_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "student_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_tasks_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "student_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string | null
          reminder_days_before: number | null
          reminder_enabled: boolean | null
          reminder_hours_before: number | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          reminder_days_before?: number | null
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          reminder_days_before?: number | null
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          created_at: string
          date: string
          description: string
          hours: number
          id: string
          project_id: string | null
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description: string
          hours: number
          id?: string
          project_id?: string | null
          task_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          hours?: number
          id?: string
          project_id?: string | null
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mode_settings: {
        Row: {
          active_mode: Database["public"]["Enums"]["app_mode"]
          created_at: string | null
          current_period_end: string | null
          id: string
          onboarding_completed: boolean | null
          plan_type: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          student_mode_enabled: boolean | null
          subscription_status: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string | null
          user_id: string
          work_mode_enabled: boolean | null
        }
        Insert: {
          active_mode?: Database["public"]["Enums"]["app_mode"]
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          onboarding_completed?: boolean | null
          plan_type?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          student_mode_enabled?: boolean | null
          subscription_status?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
          user_id: string
          work_mode_enabled?: boolean | null
        }
        Update: {
          active_mode?: Database["public"]["Enums"]["app_mode"]
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          onboarding_completed?: boolean | null
          plan_type?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          student_mode_enabled?: boolean | null
          subscription_status?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
          user_id?: string
          work_mode_enabled?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string
          email: string
          first_name: string
          id: string
          last_name: string
          status: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department: string
          email: string
          first_name: string
          id?: string
          last_name: string
          status?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          status?: string
        }
        Relationships: []
      }
      work_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          project_id: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      work_profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          department: string | null
          id: string
          job_title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          job_title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          job_title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_search: {
        Row: {
          department: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          status: string | null
        }
        Insert: {
          department?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          status?: string | null
        }
        Update: {
          department?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_hour_bank_balance: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_friend_connection: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      is_conversation_creator: {
        Args: { conversation_id: string; user_id: string }
        Returns: boolean
      }
      is_conversation_member: {
        Args: { conversation_id: string; user_id: string }
        Returns: boolean
      }
      is_in_same_game_room: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      is_room_member: {
        Args: { room_id_param: string }
        Returns: boolean
      }
      is_student_conversation_member: {
        Args: { conv_id: string }
        Returns: boolean
      }
      shares_conversation_with: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      start_direct_conversation: {
        Args: { recipient_id: string }
        Returns: string
      }
      validate_password: {
        Args: { password: string }
        Returns: boolean
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
    }
    Enums: {
      app_mode: "student" | "work"
      app_role:
        | "admin"
        | "project_manager"
        | "developer"
        | "designer"
        | "team_member"
      assignment_status: "pending" | "in_progress" | "completed" | "cancelled"
      assignment_type: "assignment" | "exam" | "project" | "other"
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
      app_mode: ["student", "work"],
      app_role: [
        "admin",
        "project_manager",
        "developer",
        "designer",
        "team_member",
      ],
      assignment_status: ["pending", "in_progress", "completed", "cancelled"],
      assignment_type: ["assignment", "exam", "project", "other"],
    },
  },
} as const
