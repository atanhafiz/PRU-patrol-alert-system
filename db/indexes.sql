-- Unique order per tarikh+sesi
create unique index if not exists uniq_orders_tarikh_sesi on orders(tarikh, sesi);


-- Urutan item 1..7 per order
create unique index if not exists uniq_order_items_idx on order_items(order_id, idx);


-- Carian laju by blok/jalan
create index if not exists idx_houses_blok on houses(blok);
create index if not exists idx_houses_jalan on houses(jalan);
create index if not exists idx_checkpoints_order on checkpoints(order_id, sesi);
create index if not exists idx_checkpoints_house on checkpoints(house_id);
