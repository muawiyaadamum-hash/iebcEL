
-- Extend app_role enum with new roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'formateur';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'responsable_pedagogique';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'comptable';
