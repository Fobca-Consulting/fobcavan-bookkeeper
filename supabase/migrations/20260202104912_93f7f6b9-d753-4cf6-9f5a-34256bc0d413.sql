-- Allow client users to view their own client record via client_access
CREATE POLICY "Client users can view their own client" 
ON public.clients 
FOR SELECT 
USING (
  id IN (
    SELECT client_id 
    FROM client_access 
    WHERE user_id = auth.uid()
  )
);