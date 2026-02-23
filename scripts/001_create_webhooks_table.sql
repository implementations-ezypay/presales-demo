-- Create webhooks table to store all incoming webhook data
create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  webhook_type text not null,
  payload jsonb not null,
  headers jsonb,
  created_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists webhooks_created_at_idx on public.webhooks(created_at desc);
create index if not exists webhooks_type_idx on public.webhooks(webhook_type);
create index if not exists webhooks_payload_gin_idx on public.webhooks using gin(payload);

-- Enable RLS
alter table public.webhooks enable row level security;

-- Allow anyone to insert webhooks (for public webhook endpoint)
create policy "webhooks_insert_public" on public.webhooks 
  for insert 
  with check (true);

-- Allow anyone to select webhooks (read-only viewer)
create policy "webhooks_select_public" on public.webhooks 
  for select 
  using (true);
