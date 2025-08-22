-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup to run every hour to delete messages older than 24 hours
SELECT cron.schedule(
  'cleanup-old-messages',
  '0 * * * *', -- Every hour at minute 0
  'SELECT public.cleanup_old_messages();'
);