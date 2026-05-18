import {
  readChinaPlatformModuleSwitchConfigsFromPg,
  updateChinaPlatformModuleSwitchConfigInPg,
  type ChinaPlatformModuleSwitchPgConnection,
} from "../china-platform-module-switch-pg-repository";

type TestRow = Record<string, unknown>;

const createMutablePg = (
  rows: Record<string, TestRow[]>,
): ChinaPlatformModuleSwitchPgConnection => {
  const pg = ((tableName: string) => {
    const conditions: Array<[string, unknown]> = [];
    let pendingInsert: TestRow | undefined;

    const matches = (row: TestRow) =>
      conditions.every(([column, value]) =>
        value === null ? row[column] == null : row[column] === value,
      );

    const builder = {
      where(column: string, value: unknown) {
        conditions.push([column, value]);
        return builder;
      },
      whereNull(column: string) {
        conditions.push([column, null]);
        return builder;
      },
      orderBy() {
        return builder;
      },
      select() {
        const tableRows = rows[tableName] ?? [];

        return Promise.resolve(tableRows.filter(matches));
      },
      insert(row: TestRow) {
        pendingInsert = row;
        rows[tableName] = rows[tableName] ?? [];
        rows[tableName].push(row);

        return builder;
      },
      onConflict(column: string) {
        return {
          merge(update: TestRow) {
            if (!pendingInsert) {
              return Promise.resolve();
            }

            const tableRows = rows[tableName] ?? [];
            const conflictValue = pendingInsert[column];
            const existing = tableRows.find(
              (row) => row !== pendingInsert && row[column] === conflictValue,
            );

            if (existing) {
              Object.assign(existing, update);
              rows[tableName] = tableRows.filter((row) => row !== pendingInsert);
            }

            return Promise.resolve();
          },
        };
      },
      delete() {
        const tableRows = rows[tableName] ?? [];
        rows[tableName] = tableRows.filter((row) => !matches(row));

        return Promise.resolve();
      },
    };

    return builder;
  }) as ChinaPlatformModuleSwitchPgConnection;

  pg.schema = {
    hasTable: async (tableName: string) =>
      [
        "china_platform_module_switch_config",
        "china_platform_module_switch_config_event",
      ].includes(tableName),
  };

  return pg;
};

describe("China platform module switch PG repository", () => {
  it("updates a persisted platform module switch and writes an audit event", async () => {
    const rows: Record<string, TestRow[]> = {
      china_platform_module_switch_config: [
        {
          id: "cpms_demo",
          module_key: "livestream",
          status: "paused",
          switch_on: false,
          layer_key: "role",
          scope_key: "stallStoreStatus",
          vendor_impact_key: "storeStatusOnly",
          policy_key: "placeholderOnly",
          guardrail_key: "noRealLivestream",
          updated_at: new Date("2026-05-15T10:00:00.000Z"),
          deleted_at: null,
        },
      ],
      china_platform_module_switch_config_event: [],
    };

    const updated = await updateChinaPlatformModuleSwitchConfigInPg(
      createMutablePg(rows),
      {
        moduleKey: "livestream",
        switchOn: true,
      },
      {
        actorId: "admin_demo",
        actorType: "admin",
      },
    );

    expect(updated).toMatchObject({
      moduleKey: "livestream",
      switchOn: true,
    });
    expect(rows.china_platform_module_switch_config).toHaveLength(1);
    expect(rows.china_platform_module_switch_config[0]).toMatchObject({
      module_key: "livestream",
      switch_on: true,
      updated_by_actor_id: "admin_demo",
    });
    expect(rows.china_platform_module_switch_config_event[0]).toMatchObject({
      event_type: "platform_module_switch_updated",
      module_key: "livestream",
      before_switch_on: false,
      after_switch_on: true,
    });
  });

  it("falls back to default configs when the PG table is empty", async () => {
    const configs = await readChinaPlatformModuleSwitchConfigsFromPg(
      createMutablePg({
        china_platform_module_switch_config: [],
        china_platform_module_switch_config_event: [],
      }),
    );

    expect(configs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          moduleKey: "seafoodTrade",
          switchOn: true,
        }),
        expect.objectContaining({
          moduleKey: "livestream",
          switchOn: false,
        }),
      ]),
    );
  });
});
