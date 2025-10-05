-- Houses (import CSV → table houses)
create table if not exists houses (
id bigserial primary key,
no_rumah text not null,
jalan text,
blok text check (blok in ('Merah','Kelabu')),
catatan text
);


-- Orders harian (6 sesi)
create table if not exists orders (
id bigserial primary key,
tarikh date not null default current_date,
sesi int not null check (sesi between 1 and 6),
created_at timestamptz default now()
);


-- 7 rumah per sesi
create table if not exists order_items (
id bigserial primary key,
order_id bigint references orders(id) on delete cascade,
idx int not null check (idx between 1 and 7),
house_id bigint references houses(id)
);


-- Snap gambar checkpoint (gps simpan jsonb utk lat/lon)
create table if not exists checkpoints (
id bigserial primary key,
order_id bigint references orders(id) on delete cascade,
sesi int not null,
house_id bigint references houses(id),
photo_url text,
taken_at timestamptz default now(),
gps jsonb
);


-- Selfie & telemetri
create table if not exists telemetry_photos (
id bigserial primary key,
order_id bigint references orders(id) on delete cascade,
sesi int not null,
kind text check (kind in ('selfie_mula','selfie_tamat')),
photo_url text,
taken_at timestamptz default now(),
gps jsonb
);


-- Route polyline (opsyenal: simpan GeoJSON)
create table if not exists routes (
id bigserial primary key,
order_id bigint references orders(id) on delete cascade,
sesi int not null,
geojson jsonb,
created_at timestamptz default now()
);


-- Laporan ringkas guard
create table if not exists reports (
id bigserial primary key,
order_id bigint references orders(id) on delete cascade,
sesi int not null,
text text,
created_at timestamptz default now()
);


-- Emergency
create table if not exists emergencies (
id bigserial primary key,
guard_name text,
jenis text,
note text,
gps jsonb,
created_at timestamptz default now()
);