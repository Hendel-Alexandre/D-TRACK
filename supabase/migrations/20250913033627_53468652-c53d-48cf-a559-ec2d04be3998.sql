-- Add reminder fields to tasks table
ALTER TABLE public.tasks 
ADD COLUMN reminder_enabled boolean DEFAULT false,
ADD COLUMN reminder_days_before integer DEFAULT 0,
ADD COLUMN reminder_hours_before integer DEFAULT 0;