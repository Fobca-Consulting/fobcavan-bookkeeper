import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ClientActivity {
  id: string;
  client_id: string;
  user_id: string;
  action_type: string;
  description: string;
  created_at: string;
}

export const useClientActivities = () => {
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('client_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Error in fetchActivities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return { activities, loading, refetch: fetchActivities };
};
