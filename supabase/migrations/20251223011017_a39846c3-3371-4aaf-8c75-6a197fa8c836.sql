-- Add 'admin' role to app_role enum if not exists
-- Note: app_role enum already exists with admin, moderator, user

-- Create a function to create admin user (will be called manually)
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- This function is for documentation purposes
  -- Admin users should be created through the Auth system
  -- and then given admin role
  RAISE NOTICE 'Admin user creation should be done through Supabase Auth';
END;
$$;

-- Create a notifications table for admin to send notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_global BOOLEAN DEFAULT true,
  target_user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Everyone can view notifications (global ones or their own)
CREATE POLICY "Users can view global notifications or their own" 
ON public.notifications 
FOR SELECT 
USING (is_global = true OR target_user_id = auth.uid());

-- Only admins can create notifications
CREATE POLICY "Admins can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update notifications
CREATE POLICY "Admins can update notifications" 
ON public.notifications 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete notifications
CREATE POLICY "Admins can delete notifications" 
ON public.notifications 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin view policies for enrollments (admins can see all)
CREATE POLICY "Admins can view all enrollments" 
ON public.enrollments 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin view policies for profiles (admins can see all)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin update policies for enrollments
CREATE POLICY "Admins can update any enrollment" 
ON public.enrollments 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin insert policies for user_roles
CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create admin update policies for user_roles
CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all user roles
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));