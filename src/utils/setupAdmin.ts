
import { supabase } from "@/integrations/supabase/client";

export const setupDefaultAdmin = async () => {
  try {
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
