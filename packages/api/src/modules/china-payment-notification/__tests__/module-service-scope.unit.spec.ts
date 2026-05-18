import { CHINA_PAYMENT_NOTIFICATION_MODULE } from "../module-key";
import { resolveChinaPaymentNotificationModuleServiceFromScope } from "../module-service-scope";
import ChinaPaymentNotificationModuleService from "../service";

describe("china payment notification module service scope", () => {
  it("resolves the module service through scope.resolve", () => {
    const service = new ChinaPaymentNotificationModuleService();
    const scope = {
      resolve: jest.fn().mockImplementation((key: string) => {
        if (key === CHINA_PAYMENT_NOTIFICATION_MODULE) {
          return service;
        }

        return undefined;
      }),
    };

    expect(resolveChinaPaymentNotificationModuleServiceFromScope(scope)).toBe(
      service,
    );
  });

  it("falls back to direct container property when resolve is unavailable", () => {
    const service = new ChinaPaymentNotificationModuleService();
    const scope = {
      [CHINA_PAYMENT_NOTIFICATION_MODULE]: service,
      get resolve(): never {
        throw new Error("resolve getter should not be required");
      },
    };

    expect(resolveChinaPaymentNotificationModuleServiceFromScope(scope)).toBe(
      service,
    );
  });

  it("returns undefined when no valid module service is registered", () => {
    expect(
      resolveChinaPaymentNotificationModuleServiceFromScope({
        [CHINA_PAYMENT_NOTIFICATION_MODULE]: {},
      }),
    ).toBeUndefined();
  });
});
