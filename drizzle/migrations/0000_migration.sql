create type public.app_role as enum ('admin','user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles(user_id, role) values (new.id, 'user');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created_role after insert on auth.users for each row execute function public.handle_new_user_role();

create table public.price_items (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'Przeróbki',
  name text not null,
  price text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.price_items to anon, authenticated;
grant insert, update, delete on public.price_items to authenticated;
grant all on public.price_items to service_role;
alter table public.price_items enable row level security;
create policy "public read prices" on public.price_items for select to anon, authenticated using (true);
create policy "admin insert prices" on public.price_items for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update prices" on public.price_items for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete prices" on public.price_items for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  created_at timestamptz not null default now()
);
grant select on public.gallery_items to anon, authenticated;
grant insert, update, delete on public.gallery_items to authenticated;
grant all on public.gallery_items to service_role;
alter table public.gallery_items enable row level security;
create policy "public read gallery" on public.gallery_items for select to anon, authenticated using (true);
create policy "admin insert gallery" on public.gallery_items for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update gallery" on public.gallery_items for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete gallery" on public.gallery_items for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 255),
  phone text check (char_length(phone) <= 30),
  service text not null check (char_length(service) <= 100),
  details text not null check (char_length(details) between 1 and 2000),
  created_at timestamptz not null default now()
);
grant insert on public.quote_requests to anon, authenticated;
grant select, delete on public.quote_requests to authenticated;
grant all on public.quote_requests to service_role;
alter table public.quote_requests enable row level security;
create policy "anyone can request quote" on public.quote_requests for insert to anon, authenticated with check (true);
create policy "admin read quotes" on public.quote_requests for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete quotes" on public.quote_requests for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "admin read gallery files" on storage.objects for select to authenticated using (bucket_id='gallery' and public.has_role(auth.uid(),'admin'));
create policy "admin upload gallery files" on storage.objects for insert to authenticated with check (bucket_id='gallery' and public.has_role(auth.uid(),'admin'));
create policy "admin delete gallery files" on storage.objects for delete to authenticated using (bucket_id='gallery' and public.has_role(auth.uid(),'admin'));

insert into public.price_items (category, name, price, sort_order) values
('Spodnie','Skrócenie nogawek','od 35 zł',1),
('Spodnie','Zwężenie spodni','od 60 zł',2),
('Spodnie','Wymiana zamka','od 40 zł',3),
('Marynarki','Skrócenie rękawów','od 80 zł',4),
('Marynarki','Dopasowanie w talii','od 120 zł',5),
('Marynarki','Wymiana podszewki','od 250 zł',6),
('Koszule','Zwężenie koszuli','od 50 zł',7),
('Koszule','Skrócenie rękawów','od 45 zł',8),
('Szycie na miarę','Garnitur dwuczęściowy','od 3200 zł',9),
('Szycie na miarę','Koszula na miarę','od 450 zł',10);

insert into public.gallery_items (title, description, image_url) values
('Garnitur granatowy','Szyty na miarę, wełna Super 120s','/images/g1.jpg'),
('Detal klapy','Ręcznie obszywana dziurka','/images/g2.jpg'),
('Przymiarka','Dopasowanie marynarki w talii','/images/g3.jpg'),
('Spodnie w kant','Skrócenie i zwężenie','/images/g4.jpg'),
('Tkaniny','Wybór wełen włoskich i angielskich','/images/g5.jpg'),
('Garnitur trzyczęściowy','Szary flanel z kamizelką','/images/g6.jpg');