import {
  RefundReviewQuerySurfaceRepositoryReaders,
} from "./refund-state-mutation-review-query-surface-repository-resolver";
import { ContainerLike } from "./container-access";
import {
  resolveRefundReviewQuerySurfacePgReadersFromContainer,
} from "./refund-review-query-surface-repository-registration";

type RefundReviewQuerySurfaceRequestLike = {
  scope?: ContainerLike;
};

export const resolveRefundReviewQuerySurfacePgReaders = async (
  req: RefundReviewQuerySurfaceRequestLike,
): Promise<RefundReviewQuerySurfaceRepositoryReaders | undefined> => {
  return resolveRefundReviewQuerySurfacePgReadersFromContainer(req.scope);
};

export {
  resolveRefundReviewQuerySurfacePgReadersFromContainer as resolveRefundReviewQuerySurfacePgReadersFromScope,
} from "./refund-review-query-surface-repository-registration";
