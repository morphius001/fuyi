import { CHINA_PAYMENT_NOTIFICATION_MODULE } from "./module-key";
import { ContainerLike, resolveContainerKey } from "./container-access";
import ChinaPaymentNotificationModuleService from "./service";

export const resolveChinaPaymentNotificationModuleServiceFromScope = (
  scope: ContainerLike | undefined,
): ChinaPaymentNotificationModuleService | undefined => {
  const isModuleService = (
    value: unknown,
  ): value is ChinaPaymentNotificationModuleService =>
    Boolean(
      value &&
        typeof (
          value as ChinaPaymentNotificationModuleService
        ).resolveRefundReviewQuerySurfaceRepositoryReaders === "function",
    );

  const service = resolveContainerKey(
    scope,
    CHINA_PAYMENT_NOTIFICATION_MODULE,
  ) as ChinaPaymentNotificationModuleService | undefined;

  if (isModuleService(service)) {
    return service;
  }

  return undefined;
};
