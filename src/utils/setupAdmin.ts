
import { supabase } from "@/integrations/supabase/client";

export const setupDefaultAdmin = async () => {
  try {
    console.log('Setting up default admin...');
    
    const { data, error } = await supabase.functions.invoke('create-default-admin', {
      method: 'POST',
      body: {},
    });
    
    if (error) {
      console.error('Error setting up default admin:', error);
      return false;
    }
    
    console.log('Admin setup response:', data);
    return true;
  } catch (e) {
    console.error('Exception during admin setup:', e);
    return false;
  }
};

// Force setup function for troubleshooting
export const forceSetupAdmin = async () => {
  try {
    // First, try to delete existing profiles with admin role
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('role', 'admin');
    
    if (deleteError) {
      console.error('Error clearing existing admins:', deleteError);
    }
    
    // Then create new admin
    return await setupDefaultAdmin();
  } catch (e) {
    console.error('Exception during force setup:', e);
    return false;
  }
};
