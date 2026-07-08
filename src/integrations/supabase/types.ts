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
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          created_at: string
          entity_id: string | null
          entity_label: string | null
          entity_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      certificate_templates: {
        Row: {
          active: boolean
          background_image_url: string | null
          created_at: string
          footer_text: string | null
          header_title: string
          id: string
          institution_name: string
          institution_subtitle: string | null
          is_default: boolean
          name: string
          primary_color: string
          signatory_name: string
          signatory_title: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          background_image_url?: string | null
          created_at?: string
          footer_text?: string | null
          header_title?: string
          id?: string
          institution_name?: string
          institution_subtitle?: string | null
          is_default?: boolean
          name: string
          primary_color?: string
          signatory_name?: string
          signatory_title?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          background_image_url?: string | null
          created_at?: string
          footer_text?: string | null
          header_title?: string
          id?: string
          institution_name?: string
          institution_subtitle?: string | null
          is_default?: boolean
          name?: string
          primary_color?: string
          signatory_name?: string
          signatory_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          attempt_id: string | null
          code: string
          combined_percent: number | null
          created_at: string
          cursus_id: string
          cursus_title: string
          id: string
          issued_at: string
          project_grade: number | null
          qcm_score: number | null
          qcm_total: number | null
          score: number
          signature_hash: string | null
          student_name: string
          template_id: string | null
          total: number
          user_id: string
        }
        Insert: {
          attempt_id?: string | null
          code: string
          combined_percent?: number | null
          created_at?: string
          cursus_id: string
          cursus_title: string
          id?: string
          issued_at?: string
          project_grade?: number | null
          qcm_score?: number | null
          qcm_total?: number | null
          score: number
          signature_hash?: string | null
          student_name: string
          template_id?: string | null
          total: number
          user_id: string
        }
        Update: {
          attempt_id?: string | null
          code?: string
          combined_percent?: number | null
          created_at?: string
          cursus_id?: string
          cursus_title?: string
          id?: string
          issued_at?: string
          project_grade?: number | null
          qcm_score?: number | null
          qcm_total?: number | null
          score?: number
          signature_hash?: string | null
          student_name?: string
          template_id?: string | null
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
          option_orders: Json
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
          option_orders?: Json
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
          option_orders?: Json
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
          correct_options: string[]
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
          question_type: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          correct_option: string
          correct_options?: string[]
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
          question_type?: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          correct_option?: string
          correct_options?: string[]
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
          question_type?: string
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
          content_html: string | null
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
          content_html?: string | null
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
          content_html?: string | null
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
      module_resources: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          external_url: string | null
          file_path: string | null
          file_type: string | null
          id: string
          module_id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          external_url?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          module_id: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          external_url?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          module_id?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_resources_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "cursus_modules"
            referencedColumns: ["id"]
          },
        ]
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
      partner_certificates: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          issued_at: string | null
          notes: string | null
          program_id: string
          revoked_at: string | null
          score: number | null
          status: Database["public"]["Enums"]["partner_cert_status"]
          student_email: string | null
          student_name: string
          total: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          notes?: string | null
          program_id: string
          revoked_at?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["partner_cert_status"]
          student_email?: string | null
          student_name: string
          total?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          notes?: string | null
          program_id?: string
          revoked_at?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["partner_cert_status"]
          student_email?: string | null
          student_name?: string
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_certificates_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "partner_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_programs: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          display_order: number
          duration: string | null
          end_date: string | null
          footer_text: string | null
          header_title: string | null
          hero_image_url: string | null
          highlights: Json
          id: string
          location: string | null
          long_description: string | null
          name: string
          partner_logo_url: string | null
          partner_name: string
          partner_url: string | null
          primary_color: string | null
          signatory_name: string | null
          signatory_title: string | null
          slug: string
          start_date: string | null
          status: string
          template_bg_url: string | null
          template_prompt: string | null
          template_source: string
          template_updated_at: string | null
          template_version: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          duration?: string | null
          end_date?: string | null
          footer_text?: string | null
          header_title?: string | null
          hero_image_url?: string | null
          highlights?: Json
          id?: string
          location?: string | null
          long_description?: string | null
          name: string
          partner_logo_url?: string | null
          partner_name: string
          partner_url?: string | null
          primary_color?: string | null
          signatory_name?: string | null
          signatory_title?: string | null
          slug: string
          start_date?: string | null
          status?: string
          template_bg_url?: string | null
          template_prompt?: string | null
          template_source?: string
          template_updated_at?: string | null
          template_version?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          duration?: string | null
          end_date?: string | null
          footer_text?: string | null
          header_title?: string | null
          hero_image_url?: string | null
          highlights?: Json
          id?: string
          location?: string | null
          long_description?: string | null
          name?: string
          partner_logo_url?: string | null
          partner_name?: string
          partner_url?: string | null
          primary_color?: string | null
          signatory_name?: string | null
          signatory_title?: string | null
          slug?: string
          start_date?: string | null
          status?: string
          template_bg_url?: string | null
          template_prompt?: string | null
          template_source?: string
          template_updated_at?: string | null
          template_version?: number
          updated_at?: string
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
          cursus_id: string | null
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
          cursus_id?: string | null
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
          cursus_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "project_submissions_cursus_id_fkey"
            columns: ["cursus_id"]
            isOneToOne: false
            referencedRelation: "cursus"
            referencedColumns: ["id"]
          },
        ]
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
          difficulty: string
          id: string
          level: string
          options: Json
          order: number
          question: string
          quiz_id: string
          theme: string | null
        }
        Insert: {
          correct_index: number
          created_at?: string
          difficulty?: string
          id?: string
          level?: string
          options: Json
          order?: number
          question: string
          quiz_id: string
          theme?: string | null
        }
        Update: {
          correct_index?: number
          created_at?: string
          difficulty?: string
          id?: string
          level?: string
          options?: Json
          order?: number
          question?: string
          quiz_id?: string
          theme?: string | null
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
          cursus_id: string | null
          description: string | null
          id: string
          level: string
          module_id: string | null
          passing_score: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          cursus_id?: string | null
          description?: string | null
          id?: string
          level?: string
          module_id?: string | null
          passing_score?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          cursus_id?: string | null
          description?: string | null
          id?: string
          level?: string
          module_id?: string | null
          passing_score?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_cursus_id_fkey"
            columns: ["cursus_id"]
            isOneToOne: false
            referencedRelation: "cursus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "cursus_modules"
            referencedColumns: ["id"]
          },
        ]
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
      can_take_final_exam: {
        Args: { _cursus_id: string; _user_id: string }
        Returns: Json
      }
      compute_final_grade: {
        Args: { _cursus_id: string; _user_id: string }
        Returns: Json
      }
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
      partner_cert_status: "pending" | "issued" | "revoked" | "expired"
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
      partner_cert_status: ["pending", "issued", "revoked", "expired"],
    },
  },
} as const
