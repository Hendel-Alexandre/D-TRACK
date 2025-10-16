-- Remove public access to avatars bucket
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Add relationship-based access policy for avatars
-- Users can only view avatars of people they're connected with
CREATE POLICY "Users can view avatars of connections"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (
    -- Can view own avatar
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- Can view friend's avatar
    has_friend_connection((storage.foldername(name))[1]::uuid) OR
    -- Can view teammate's avatar (shares conversation)
    shares_conversation_with((storage.foldername(name))[1]::uuid) OR
    -- Can view game room member's avatar
    is_in_same_game_room((storage.foldername(name))[1]::uuid)
  )
);

-- Keep existing upload/update/delete policies unchanged
-- (Users can still manage their own avatars)