-- The Intimate Table — The House
-- Initial schema. See DATABASE_SCHEMA.md.

create extension if not exists pgcrypto;

-- Visibility of anything in the House, for one viewer.
create type house_state as enum ('absent', 'sealed', 'open');

-- ── People ─────────────────────────────────────────────────────────────

create table profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  display_name      text not null,
  first_name        text not null,
  place_card_motif  text not null default 'shell',
  line              text,
  contact           text,
  role              text not null default 'guest' check (role in ('guest', 'host')),
  created_at        timestamptz not null default now()
);

-- ── Chapters ───────────────────────────────────────────────────────────

create table chapters (
  id                text primary key default gen_random_uuid()::text,
  slug              text not null unique,
  number            text not null,
  title             text,
  subtitle          text,
  description       text,
  location_label    text,
  prelude_opens_at  timestamptz,
  starts_at         timestamptz,
  ends_at           timestamptz,
  afterglow_at      timestamptz,
  identity          jsonb not null default '{}'::jsonb,
  base_state        house_state not null default 'open',
  sort              int not null default 0,
  created_at        timestamptz not null default now()
);

create table chapter_participants (
  chapter_id        text not null references chapters (id) on delete cascade,
  user_id           uuid not null references profiles (id) on delete cascade,
  status            text not null default 'invited'
                    check (status in ('invited', 'confirmed', 'attended', 'declined')),
  role              text not null default 'guest'
                    check (role in ('guest', 'host', 'coach', 'chef', 'speaker')),
  seat_label        text,
  place_card_motif  text,
  created_at        timestamptz not null default now(),
  primary key (chapter_id, user_id)
);

create table preludes (
  id                text primary key default gen_random_uuid()::text,
  chapter_id        text not null references chapters (id) on delete cascade,
  kind              text not null
                    check (kind in ('question', 'music', 'clue', 'coordinates', 'dress', 'bring', 'challenge', 'thought')),
  title             text not null,
  body              text,
  response_prompt   text,
  opens_at          timestamptz,
  sort              int not null default 0,
  created_at        timestamptz not null default now()
);

create table invitations (
  id                text primary key default gen_random_uuid()::text,
  chapter_id        text not null references chapters (id) on delete cascade,
  user_id           uuid not null references profiles (id) on delete cascade,
  code              text not null unique default encode(gen_random_bytes(9), 'hex'),
  message           text,
  status            text not null default 'sent'
                    check (status in ('sent', 'opened', 'accepted', 'declined')),
  expires_at        timestamptz,
  opened_at         timestamptz,
  created_at        timestamptz not null default now(),
  unique (chapter_id, user_id)
);

-- ── The House ──────────────────────────────────────────────────────────

create table rooms (
  key               text primary key,
  name              text not null,
  epigraph          text,
  base_state        house_state not null default 'open',
  sort              int not null default 0
);

create table media_assets (
  id                text primary key default gen_random_uuid()::text,
  kind              text not null check (kind in ('image', 'audio', 'video')),
  url               text,
  storage_path      text,
  alt               text,
  caption           text,
  credit            text,
  scene             text,          -- placeholder drawing when no file exists yet
  chapter_id        text references chapters (id) on delete set null,
  owner_user_id     uuid references profiles (id) on delete cascade,
  created_at        timestamptz not null default now(),
  check (url is not null or storage_path is not null or scene is not null)
);

create table memory_objects (
  id                text primary key default gen_random_uuid()::text,
  slug              text not null unique,
  kind              text not null,
  label             text,
  title             text not null,
  caption           text,
  room_key          text not null references rooms (key),
  chapter_id        text references chapters (id) on delete cascade,
  user_id           uuid references profiles (id) on delete cascade,
  base_state        house_state not null default 'open',
  sealed_hint       text,
  placement         jsonb not null default '{}'::jsonb,
  sort              int not null default 0,
  created_at        timestamptz not null default now()
);

create table memories (
  id                text primary key default gen_random_uuid()::text,
  object_id         text not null unique references memory_objects (id) on delete cascade,
  title             text,
  occurred_at       timestamptz,
  location_label    text,
  blocks            jsonb not null default '[]'::jsonb,
  created_at        timestamptz not null default now()
);

create table knowledge_items (
  id                text primary key default gen_random_uuid()::text,
  slug              text not null unique,
  kind              text not null
                    check (kind in ('book', 'notebook', 'card', 'letter', 'audio', 'annotated')),
  subject           text not null,
  title             text not null,
  author            text,
  excerpt           text,
  body              text,
  chapter_id        text references chapters (id) on delete set null,
  base_state        house_state not null default 'open',
  sealed_hint       text,
  spine             jsonb not null default '{}'::jsonb,
  sort              int not null default 0,
  created_at        timestamptz not null default now()
);

create table house_events (
  id                text primary key default gen_random_uuid()::text,
  kind              text not null check (kind in ('letter', 'clue', 'seasonal', 'notice')),
  room_key          text not null default 'hall' references rooms (key),
  title             text,
  body              text not null,
  signature         text,
  chapter_id        text references chapters (id) on delete cascade,
  user_id           uuid references profiles (id) on delete cascade,
  base_state        house_state not null default 'open',
  starts_at         timestamptz,
  ends_at           timestamptz,
  created_at        timestamptz not null default now()
);

-- ── Logic of appearance ────────────────────────────────────────────────

create table unlock_rules (
  id                text primary key default gen_random_uuid()::text,
  name              text not null,
  target_type       text not null
                    check (target_type in ('memory_object', 'knowledge_item', 'room', 'house_event', 'chapter')),
  target_id         text not null,
  effect            text not null check (effect in ('reveal', 'open')),
  conditions        jsonb not null,
  active            boolean not null default true,
  notes             text,
  created_at        timestamptz not null default now()
);
create index unlock_rules_target on unlock_rules (target_type, target_id);

create table user_unlocks (
  id                text primary key default gen_random_uuid()::text,
  user_id           uuid not null references profiles (id) on delete cascade,
  target_type       text not null,
  target_id         text not null,
  granted_state     house_state,
  granted_at        timestamptz,
  seen_at           timestamptz,
  source            text,
  unique (user_id, target_type, target_id)
);

create table people_connections (
  id                text primary key default gen_random_uuid()::text,
  from_user         uuid not null references profiles (id) on delete cascade,
  to_user           uuid not null references profiles (id) on delete cascade,
  chapter_id        text references chapters (id) on delete set null,
  created_at        timestamptz not null default now(),
  unique (from_user, to_user),
  check (from_user <> to_user)
);

create table journal_entries (
  id                text primary key default gen_random_uuid()::text,
  user_id           uuid not null references profiles (id) on delete cascade,
  chapter_id        text references chapters (id) on delete set null,
  prelude_id        text references preludes (id) on delete set null,
  object_id         text references memory_objects (id) on delete set null,
  prompt            text,
  body              text not null,
  sealed_until      timestamptz,
  created_at        timestamptz not null default now()
);

create table interactions (
  id                text primary key default gen_random_uuid()::text,
  user_id           uuid not null references profiles (id) on delete cascade,
  kind              text not null check (kind in ('scan')),
  ref               text not null,
  created_at        timestamptz not null default now()
);
create index interactions_user on interactions (user_id, kind, ref);

-- ── Security ───────────────────────────────────────────────────────────
-- Every table has RLS. Content tables have no policies for anon/authenticated:
-- the House is composed on the server (service role) so hidden things stay hidden.

alter table profiles             enable row level security;
alter table chapters             enable row level security;
alter table chapter_participants enable row level security;
alter table preludes             enable row level security;
alter table invitations          enable row level security;
alter table rooms                enable row level security;
alter table media_assets         enable row level security;
alter table memory_objects       enable row level security;
alter table memories             enable row level security;
alter table knowledge_items      enable row level security;
alter table house_events         enable row level security;
alter table unlock_rules         enable row level security;
alter table user_unlocks         enable row level security;
alter table people_connections   enable row level security;
alter table journal_entries      enable row level security;
alter table interactions         enable row level security;

create policy "read own profile"   on profiles for select to authenticated using (id = auth.uid());
create policy "update own profile" on profiles for update to authenticated using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from profiles p where p.id = auth.uid()));

-- A profile row for every new auth user.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name, first_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'first_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Private bucket for photographs, audio and video.
insert into storage.buckets (id, name, public) values ('house', 'house', false)
  on conflict (id) do nothing;
