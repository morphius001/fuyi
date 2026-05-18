import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260515000100 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table if not exists "china_unit_permission_config" (
        "id" text not null,
        "unit_key" text not null,
        "status" text not null,
        "unit_type_key" text not null,
        "market_key" text not null,
        "guardrail_key" text not null,
        "module_access" jsonb not null default '[]'::jsonb,
        "source" text not null default 'admin_draft',
        "updated_by_actor_id" text null,
        "updated_by_actor_type" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "china_unit_permission_config_pkey" primary key ("id"),
        constraint "china_unit_permission_config_unit_unique" unique ("unit_key"),
        constraint "china_unit_permission_config_status_check" check ("status" in ('enabled', 'pilot', 'reviewing', 'disabled')),
        constraint "china_unit_permission_config_unit_type_check" check ("unit_type_key" in ('merchantStall', 'merchantStore', 'deliverySupplier', 'materialSupplier'))
      );
    `);

    this.addSql(`
      create index if not exists "IDX_china_unit_permission_config_market"
      on "china_unit_permission_config" ("market_key")
      where "deleted_at" is null;
    `);

    this.addSql(`
      create table if not exists "china_unit_permission_seller_binding" (
        "id" text not null,
        "unit_key" text not null,
        "seller_id" text null,
        "seller_handle" text null,
        "status" text not null default 'active',
        "source" text not null default 'admin_binding',
        "updated_by_actor_id" text null,
        "updated_by_actor_type" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "china_unit_permission_seller_binding_pkey" primary key ("id"),
        constraint "china_unit_permission_seller_binding_identity_check" check ("seller_id" is not null or "seller_handle" is not null),
        constraint "china_unit_permission_seller_binding_status_check" check ("status" in ('active', 'paused', 'disabled')),
        constraint "china_unit_permission_seller_binding_source_check" check ("source" in ('admin_binding', 'seed_binding', 'metadata_fallback'))
      );
    `);

    this.addSql(`
      create unique index if not exists "IDX_china_unit_permission_seller_binding_unit"
      on "china_unit_permission_seller_binding" ("unit_key")
      where "deleted_at" is null;
    `);

    this.addSql(`
      create unique index if not exists "IDX_china_unit_permission_seller_binding_seller_id"
      on "china_unit_permission_seller_binding" ("seller_id")
      where "deleted_at" is null and "seller_id" is not null;
    `);

    this.addSql(`
      create unique index if not exists "IDX_china_unit_permission_seller_binding_handle"
      on "china_unit_permission_seller_binding" ("seller_handle")
      where "deleted_at" is null and "seller_handle" is not null;
    `);

    this.addSql(`
      create table if not exists "china_unit_permission_config_event" (
        "id" text not null,
        "event_type" text not null,
        "unit_key" text not null,
        "module_key" text null,
        "before_visible" boolean null,
        "after_visible" boolean null,
        "actor_id" text null,
        "actor_type" text not null default 'admin',
        "metadata_redacted" jsonb not null default '{}'::jsonb,
        "created_at" timestamptz not null default now(),
        constraint "china_unit_permission_config_event_pkey" primary key ("id"),
        constraint "china_unit_permission_config_event_type_check" check ("event_type" in ('unit_permission_updated', 'unit_permission_reset', 'unit_permission_binding_updated'))
      );
    `);

    this.addSql(`
      create index if not exists "IDX_china_unit_permission_config_event_unit_created"
      on "china_unit_permission_config_event" ("unit_key", "created_at");
    `);

    this.addSql(`
      create table if not exists "china_platform_module_switch_config" (
        "id" text not null,
        "module_key" text not null,
        "status" text not null,
        "switch_on" boolean not null default false,
        "layer_key" text not null,
        "scope_key" text not null,
        "vendor_impact_key" text not null,
        "policy_key" text not null,
        "guardrail_key" text not null,
        "source" text not null default 'admin_draft',
        "updated_by_actor_id" text null,
        "updated_by_actor_type" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "china_platform_module_switch_config_pkey" primary key ("id"),
        constraint "china_platform_module_switch_module_unique" unique ("module_key"),
        constraint "china_platform_module_switch_status_check" check ("status" in ('enabled', 'disabled', 'pilot', 'reviewing', 'paused')),
        constraint "china_platform_module_switch_layer_check" check ("layer_key" in ('platform', 'market', 'role'))
      );
    `);

    this.addSql(`
      create index if not exists "IDX_china_platform_module_switch_config_layer"
      on "china_platform_module_switch_config" ("layer_key")
      where "deleted_at" is null;
    `);

    this.addSql(`
      create table if not exists "china_platform_module_switch_config_event" (
        "id" text not null,
        "event_type" text not null,
        "module_key" text not null,
        "before_switch_on" boolean null,
        "after_switch_on" boolean null,
        "actor_id" text null,
        "actor_type" text not null default 'admin',
        "metadata_redacted" jsonb not null default '{}'::jsonb,
        "created_at" timestamptz not null default now(),
        constraint "china_platform_module_switch_config_event_pkey" primary key ("id"),
        constraint "china_platform_module_switch_event_type_check" check ("event_type" in ('platform_module_switch_updated', 'platform_module_switch_reset'))
      );
    `);

    this.addSql(`
      create index if not exists "IDX_china_platform_module_switch_event_module_created"
      on "china_platform_module_switch_config_event" ("module_key", "created_at");
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      drop table if exists "china_platform_module_switch_config_event";
      drop table if exists "china_platform_module_switch_config";
      drop table if exists "china_unit_permission_config_event";
      drop table if exists "china_unit_permission_seller_binding";
      drop table if exists "china_unit_permission_config";
    `);
  }
}
