-- Create storage bucket for message files
INSERT INTO storage.buckets (id, name, public) VALUES ('message-files', 'message-files', false);

-- Create policy for users to upload their own files
CREATE POLICY "Users can upload their own message files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'message-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy for users to view their own files
CREATE POLICY "Users can view their own message files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'message-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy for users to delete their own files
CREATE POLICY "Users can delete their own message files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'message-files' AND auth.uid()::text = (storage.foldername(name))[1]);