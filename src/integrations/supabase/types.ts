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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          attempt_id: string | null
          code: string
          created_at: string
          cursus_id: string
          cursus_title: string
          id: string
          issued_at: string
          score: number
          student_name: string
          total: number
          user_id: string
        }
        Insert: {
          attempt_id?: string | null
          code: string
          created_at?: string
          cursus_id: string
          cursus_title: string
          id?: string
          issued_at?: string
          score: number
          student_name: string
          total: number
          user_id: string
        }
        Update: {
          attempt_id?: string | null
          code?: string
          created_at?: string
          cursus_id?: string
          cursus_title?: string
          id?: string
          issued_at?: string
          score?: number
          student_name?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_cursus_id_fkey"
            columns: ["cursus_id"]
            isOneToOne: false
            referencedRelation: "cursus"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          created_at: string
          cursus_id: string
          id: string
          notes: string | null
          payment_reference: string | null
          status: string
          updated_at: string
          user_id: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          created_at?: string
          cursus_id: string
          id?: string
          notes?: string | null
          payment_reference?: string | null
          status?: string
          updated_at?: string
          user_id: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          created_at?: string
          cursus_id?: string
          id?: string
          notes?: string | null
          payment_reference?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_cursus_id_fkey"
            columns: ["cursus_id"]
            isOneToOne: false
            referencedRelation: "cursus"
            referencedColumns: ["id"]
          },
        ]
      }
      cursus: {
        Row: {
          certification: boolean
          created_at: string
          description: string | null
          display_order: number
          duration_hours: number
          duration_label: string | null
          featured: boolean
          id: string
          image_url: string | null
          level: string | null
          modality: string | null
          objectives: string | null
          pole_id: string
          price_xaf: number
          published: boolean
          registration_fee_xaf: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          certification?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          duration_hours?: number
          duration_label?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          level?: string | null
          modality?: string | null
          objectives?: string | null
          pole_id: string
          price_xaf?: number
          published?: boolean
          registration_fee_xaf?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          certification?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          duration_hours?: number
          duration_label?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          level?: string | null
          modality?: string | null
          objectives?: string | null
          pole_id?: string
          price_xaf?: number
          published?: boolean
          registration_fee_xaf?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cursus_pole_id_fkey"
            columns: ["pole_id"]
            isOneToOne: false
            referencedRelation: "poles"
            referencedColumns: ["id"]
          },
        ]
      }
      cursus_modules: {
        Row: {
          created_at: string
          cursus_id: string
          description: string | null
          display_order: number
          duration_hours: number
          formateur_id: string | null
          id: string
          locked: boolean
          published: boolean
          required: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cursus_id: string
          description?: string | null
          display_order?: number
          duration_hours?: number
          formateur_id?: string | null
          id?: string
          locked?: boolean
          published?: boolean
          required?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cursus_id?: string
          description?: string | null
          display_order?: number
          duration_hours?: number
          formateur_id?: string | null
          id?: string
          locked?: boolean
          published?: boolean
          required?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cursus_modules_cursus_id_fkey"
            columns: ["cursus_id"]
            isOneToOne: false
            referencedRelation: "cursus"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          payment_reference: string | null
          payment_status: string | null
          progress: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          payment_reference?: string | null
          payment_status?: string | null
          progress?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          payment_reference?: string | null
          payment_status?: string | null
          progress?: number | null
          user_id?: string
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          answers: Json
          created_at: string
          cursus_id: string
          id: string
          passed: boolean | null
          question_ids: Json
          score: number | null
          started_at: string
          status: string
          submitted_at: string | null
          total: number
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          cursus_id: string
          id?: string
          passed?: boolean | null
          question_ids?: Json
          score?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          total?: number
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          cursus_id?: string
          id?: string
          passed?: boolean | null
          question_ids?: Json
          score?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_cursus_id_fkey"
            columns: ["cursus_id"]
            isOneToOne: false
            referencedRelation: "cursus"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_question_bank: {
        Row: {
          correct_option: string
          created_at: string
          created_by: string | null
          cursus_id: string
          difficulty: string | null
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          published: boolean
          question: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          correct_option: string
          created_at?: string
          created_by?: string | null
          cursus_id: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          published?: boolean
          question: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          correct_option?: string
          created_at?: string
          created_by?: string | null
          cursus_id?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          published?: boolean
          question?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_question_bank_cursus_id_fkey"
            columns: ["cursus_id"]
            isOneToOne: false
            referencedRelation: "cursus"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string
          display_order: number
          duration_minutes: number | null
          external_url: string | null
          file_path: string | null
          id: string
          lesson_type: string
          module_id: string
          published: boolean
          required: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          display_order?: number
          duration_minutes?: number | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          lesson_type?: string
          module_id: string
          published?: boolean
          required?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          display_order?: number
          duration_minutes?: number | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          lesson_type?: string
          module_id?: string
          published?: boolean
          required?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "cursus_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          created_at: string
          cursus_id: string
          description: string | null
          duration_minutes: number
          ended_at: string | null
          external_url: string | null
          host_id: string | null
          id: string
          module_id: string | null
          provider: string
          published: boolean
          recording_url: string | null
          room_name: string | null
          scheduled_at: string
          started_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cursus_id: string
          description?: string | null
          duration_minutes?: number
          ended_at?: string | null
          external_url?: string | null
          host_id?: string | null
          id?: string
          module_id?: string | null
          provider?: string
          published?: boolean
          recording_url?: string | null
          room_name?: string | null
          scheduled_at: string
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cursus_id?: string
          description?: string | null
          duration_minutes?: number
          ended_at?: string | null
          external_url?: string | null
          host_id?: string | null
          id?: string
          module_id?: string | null
          provider?: string
          published?: boolean
          recording_url?: string | null
          room_name?: string | null
          scheduled_at?: string
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_cursus_id_fkey"
            columns: ["cursus_id"]
            isOneToOne: false
            referencedRelation: "cursus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "cursus_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          module_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          module_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_global: boolean | null
          message: string
          target_user_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_global?: boolean | null
          message: string
          target_user_id?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_global?: boolean | null
          message?: string
          target_user_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      poles: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          education: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          education?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          education?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_submissions: {
        Row: {
          admin_feedback: string | null
          course_id: string
          file_name: string
          file_path: string
          file_size: number | null
          grade: number | null
          id: string
          notes: string | null
          reviewed_at: string | null
          status: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          admin_feedback?: string | null
          course_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          grade?: number | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          admin_feedback?: string | null
          course_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          grade?: number | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          course_id: string
          created_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          total: number
          user_id: string
        }
        Insert: {
          answers: Json
          course_id: string
          created_at?: string
          id?: string
          passed: boolean
          quiz_id: string
          score: number
          total: number
          user_id: string
        }
        Update: {
          answers?: Json
          course_id?: string
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_index: number
          created_at: string
          id: string
          options: Json
          order: number
          question: string
          quiz_id: string
        }
        Insert: {
          correct_index: number
          created_at?: string
          id?: string
          options: Json
          order?: number
          question: string
          quiz_id: string
        }
        Update: {
          correct_index?: number
          created_at?: string
          id?: string
          options?: Json
          order?: number
          question?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          passing_score: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          passing_score?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          passing_score?: number
          title?: string
          updated_at?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_user: {
        Args: {
          admin_email: string
          admin_name: string
          admin_password: string
        }
        Returns: undefined
      }
      draw_exam_questions: {
        Args: { _cursus_id: string; _n?: number }
        Returns: string[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_enrolled_validated: {
        Args: { _cursus_id: string; _user_id: string }
        Returns: boolean
      }
      verify_certificate: {
        Args: { _code: string }
        Returns: {
          code: string
          cursus_title: string
          issued_at: string
          score: number
          student_name: string
          total: number
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "student"
        | "formateur"
        | "responsable_pedagogique"
        | "comptable"
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
      app_role: [
        "admin",
        "student",
        "formateur",
        "responsable_pedagogique",
        "comptable",
      ],
    },
  },
} as const
