import { ContainerLike } from "./container-access";
import { RefundReviewQuerySurfaceRepositoryReaders } from "./refund-state-mutation-review-query-surface-repository-resolver";
import {
  RefundReviewQuerySurfaceRepositoryRegistration,
  resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistrationFromContainers,
  resolveRefundReviewQuerySurfaceRepositoryReadersFromContainers,
} from "./refund-review-query-surface-repository-registration";

class ChinaPaymentNotificationModuleService {
  constructor(private readonly container?: ContainerLike) {}

  getRefundReviewQuerySurfaceRepositoryRegistration(
    scope: ContainerLike | undefined,
  ): RefundReviewQuerySurfaceRepositoryRegistration | undefined {
    return resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistrationFromContainers(
      [this.container, scope],
    );
  }

  async resolveRefundReviewQuerySurfaceRepositoryReaders(
    scope: ContainerLike | undefined,
  ): Promise<RefundReviewQuerySurfaceRepositoryReaders | undefined> {
    return resolveRefundReviewQuerySurfaceRepositoryReadersFromContainers([
      this.container,
      scope,
    ]);
  }

  async getRefundReviewQuerySurfaceRepositoryReaders(
    scope: ContainerLike | undefined,
  ): Promise<RefundReviewQuerySurfaceRepositoryReaders | undefined> {
    return this.resolveRefundReviewQuerySurfaceRepositoryReaders(scope);
  }
}

export default ChinaPaymentNotificationModuleService;
