-- Create api_logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  request_body JSONB,
  response JSONB NOT NULL,
  status INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on timestamp for efficient querying
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp DESC);

-- Set up Row Level Security (optional - allows anonymous access for demo)
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous users to insert logs
CREATE POLICY "Allow anonymous to insert logs" ON api_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for anonymous users to read logs
CREATE POLICY "Allow anonymous to read logs" ON api_logs
  FOR SELECT
  TO anon
  USING (true);
