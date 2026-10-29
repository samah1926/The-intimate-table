create table public.chapter_zero_responses (
  id uuid primary key default gen_random_uuid(),
  submission_token uuid not null unique,
  answers jsonb not null,
  paid boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.chapter_zero_responses enable row level security;
-- No anonymous SELECT/UPDATE. Access is exclusively through server-side service role.
create function public.submit_chapter_zero(p_token uuid, p_answers jsonb) returns void
language sql security invoker set search_path = public as $$
  insert into chapter_zero_responses (submission_token, answers) values (p_token, p_answers)
  on conflict (submission_token) do update set answers = excluded.answers, updated_at = now();
$$;
revoke all on function public.submit_chapter_zero(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.submit_chapter_zero(uuid,jsonb) to service_role;
