import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260507000100 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table if not exists "china_market" (
        "id" text not null,
        "name" text not null,
        "slug" text not null,
        "province" text null,
        "city" text not null,
        "district" text null,
        "address" text null,
        "timezone" text not null default 'Asia/Shanghai',
        "status" text not null default 'draft',
        "service_range_note" text null,
        "metadata" jsonb not null default '{}'::jsonb,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "china_market_pkey" primary key ("id"),
        constraint "china_market_status_check" check ("status" in ('draft', 'open', 'paused', 'closed'))
      );
    `)

    this.addSql(`
      create unique index if not exists "IDX_china_market_slug_unique"
      on "china_market" ("slug")
      where "deleted_at" is null;
    `)

    this.addSql(`
      create index if not exists "IDX_china_market_status_city"
      on "china_market" ("status", "city")
      where "deleted_at" is null;
    `)

    this.addSql(`
      create table if not exists "china_market_membership" (
        "id" text not null,
        "market_id" text not null,
        "seller_id" text not null,
        "seller_handle" text null,
        "seller_name" text null,
        "booth_no" text not null,
        "stall_name" text null,
        "is_primary" boolean not null default false,
        "status" text not null default 'pending',
        "main_category_ids" jsonb not null default '[]'::jsonb,
        "merchant_type_keys" jsonb not null default '[]'::jsonb,
        "metadata" jsonb not null default '{}'::jsonb,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "china_market_membership_pkey" primary key ("id"),
        constraint "china_market_membership_status_check" check ("status" in ('pending', 'open', 'paused', 'closed'))
      );
    `)

    this.addSql(`
      create index if not exists "IDX_china_market_membership_seller"
      on "china_market_membership" ("seller_id")
      where "deleted_at" is null;
    `)

    this.addSql(`
      create index if not exists "IDX_china_market_membership_market_status"
      on "china_market_membership" ("market_id", "status")
      where "deleted_at" is null;
    `)

    this.addSql(`
      create index if not exists "IDX_china_market_membership_booth"
      on "china_market_membership" ("market_id", "booth_no")
      where "deleted_at" is null and "booth_no" is not null;
    `)

    this.addSql(`
      create table if not exists "china_seller_role" (
        "id" text not null,
        "seller_id" text not null,
        "market_id" text null,
        "role_key" text not null,
        "status" text not null default 'active',
        "module_hints" jsonb not null default '[]'::jsonb,
        "metadata" jsonb not null default '{}'::jsonb,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "china_seller_role_pkey" primary key ("id"),
        constraint "china_seller_role_status_check" check ("status" in ('pending', 'active', 'paused', 'rejected'))
      );
    `)

    this.addSql(`
      create index if not exists "IDX_china_seller_role_seller_market"
      on "china_seller_role" ("seller_id", "market_id", "role_key")
      where "deleted_at" is null;
    `)

    this.addSql(`
      create table if not exists "china_market_announcement" (
        "id" text not null,
        "market_id" text not null,
        "audience" text not null default 'all',
        "title" text not null,
        "content" text not null,
        "severity" text not null default 'info',
        "status" text not null default 'draft',
        "published_at" timestamptz null,
        "expires_at" timestamptz null,
        "metadata" jsonb not null default '{}'::jsonb,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "china_market_announcement_pkey" primary key ("id"),
        constraint "china_market_announcement_audience_check" check ("audience" in ('consumer', 'merchant', 'delivery_supplier', 'all')),
        constraint "china_market_announcement_severity_check" check ("severity" in ('info', 'warning', 'urgent')),
        constraint "china_market_announcement_status_check" check ("status" in ('draft', 'published', 'archived'))
      );
    `)

    this.addSql(`
      create index if not exists "IDX_china_market_announcement_market"
      on "china_market_announcement" ("market_id", "audience", "status")
      where "deleted_at" is null;
    `)

    this.addSql(`
      create index if not exists "IDX_china_market_announcement_publish_window"
      on "china_market_announcement" ("published_at", "expires_at")
      where "deleted_at" is null;
    `)

    this.addSql(`
      create table if not exists "china_market_business_hour" (
        "id" text not null,
        "market_id" text not null,
        "weekday" smallint not null,
        "opens_at" text not null,
        "closes_at" text not null,
        "is_closed" boolean not null default false,
        "note" text null,
        "metadata" jsonb not null default '{}'::jsonb,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "china_market_business_hour_pkey" primary key ("id"),
        constraint "china_market_business_hour_weekday_check" check ("weekday" between 0 and 6)
      );
    `)

    this.addSql(`
      create unique index if not exists "IDX_china_market_business_hour_unique"
      on "china_market_business_hour" ("market_id", "weekday")
      where "deleted_at" is null;
    `)

    this.addSql(`
      create table if not exists "china_market_delivery_profile" (
        "id" text not null,
        "market_id" text not null,
        "delivery_type" text not null,
        "display_name" text not null,
        "enabled" boolean not null default false,
        "cutoff_time" text null,
        "merchant_selectable" boolean not null default false,
        "runtime_enabled" boolean not null default false,
        "checkout_impact" text not null default 'none',
        "service_area_note" text null,
        "metadata" jsonb not null default '{}'::jsonb,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "china_market_delivery_profile_pkey" primary key ("id"),
        constraint "china_market_delivery_profile_type_check" check ("delivery_type" in ('market_pickup', 'merchant_self_delivery', 'market_unified_delivery', 'delivery_supplier', 'cold_chain_express')),
        constraint "china_market_delivery_profile_checkout_check" check ("checkout_impact" = 'none')
      );
    `)

    this.addSql(`
      create index if not exists "IDX_china_market_delivery_profile_market"
      on "china_market_delivery_profile" ("market_id", "delivery_type", "enabled")
      where "deleted_at" is null;
    `)
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "china_market_delivery_profile";`)
    this.addSql(`drop table if exists "china_market_business_hour";`)
    this.addSql(`drop table if exists "china_market_announcement";`)
    this.addSql(`drop table if exists "china_seller_role";`)
    this.addSql(`drop table if exists "china_market_membership";`)
    this.addSql(`drop table if exists "china_market";`)
  }
}
