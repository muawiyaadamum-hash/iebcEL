-- Create or replace function to auto-assign admin role for admin@mtech.com
CREATE OR REPLACE FUNCTION public.handle_new_user_admin_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the new user is the admin email
  IF NEW.email = 'admin@mtech.com' THEN
    -- Update the role to admin instead of the default student
    UPDATE public.user_roles 
    SET role = 'admin'
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created_admin_check ON auth.users;

-- Create trigger that fires AFTER the handle_new_user trigger (which creates the student role)
CREATE TRIGGER on_auth_user_created_admin_check
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_admin_check();