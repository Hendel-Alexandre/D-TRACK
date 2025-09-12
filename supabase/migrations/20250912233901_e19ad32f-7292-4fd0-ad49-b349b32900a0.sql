-- Create games tables for multiplayer and score tracking

-- Game rooms table
CREATE TABLE public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_name TEXT NOT NULL,
  host_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'waiting',
  room_code TEXT NOT NULL,
  game_state JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Game room members table
CREATE TABLE public.game_room_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (room_id) REFERENCES public.game_rooms(id) ON DELETE CASCADE
);

-- Game moves table
CREATE TABLE public.game_moves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL,
  user_id UUID NOT NULL,
  move_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (room_id) REFERENCES public.game_rooms(id) ON DELETE CASCADE
);

-- Game scores table
CREATE TABLE public.game_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_rooms
CREATE POLICY "Users can view game rooms they are members of" 
ON public.game_rooms 
FOR SELECT 
USING (
  id IN (
    SELECT room_id 
    FROM public.game_room_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create game rooms" 
ON public.game_rooms 
FOR INSERT 
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Room hosts can update their rooms" 
ON public.game_rooms 
FOR UPDATE 
USING (auth.uid() = host_id);

-- RLS Policies for game_room_members
CREATE POLICY "Users can view room members if they are members" 
ON public.game_room_members 
FOR SELECT 
USING (
  room_id IN (
    SELECT room_id 
    FROM public.game_room_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join rooms" 
ON public.game_room_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for game_moves
CREATE POLICY "Users can view moves in rooms they are members of" 
ON public.game_moves 
FOR SELECT 
USING (
  room_id IN (
    SELECT room_id 
    FROM public.game_room_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Room members can create moves" 
ON public.game_moves 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  room_id IN (
    SELECT room_id 
    FROM public.game_room_members 
    WHERE user_id = auth.uid()
  )
);

-- RLS Policies for game_scores
CREATE POLICY "Users can view their own scores" 
ON public.game_scores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scores" 
ON public.game_scores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores" 
ON public.game_scores 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_game_rooms_updated_at
BEFORE UPDATE ON public.game_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_scores_updated_at
BEFORE UPDATE ON public.game_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint for room codes
ALTER TABLE public.game_rooms ADD CONSTRAINT unique_room_code UNIQUE (room_code);

-- Add unique constraint for user scores per game
ALTER TABLE public.game_scores ADD CONSTRAINT unique_user_game UNIQUE (user_id, game_name);