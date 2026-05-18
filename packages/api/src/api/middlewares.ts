import { defineMiddlewares } from "@medusajs/medusa";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

const resolveVisibleSellerProductIds = async (req) => {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const now = new Date();
  const rows = await pg("product_product_seller_seller")
    .join("seller", "seller.id", "product_product_seller_seller.seller_id")
    .whereNull("product_product_seller_seller.deleted_at")
    .whereNull("seller.deleted_at")
    .where("seller.status", "open")
    .andWhere((builder) => {
      builder
        .whereNull("seller.closed_from")
        .orWhere("seller.closed_from", ">", now);
    })
    .andWhere((builder) => {
      builder
        .whereNull("seller.closed_to")
        .orWhere("seller.closed_to", "<", now);
    })
    .select("product_product_seller_seller.product_id");

  return rows.map((row) => row.product_id);
};

const intersectIds = (currentIdFilter, visibleProductIds: string[]) => {
  if (!currentIdFilter) {
    return visibleProductIds;
  }

  if (typeof currentIdFilter === "string") {
    return visibleProductIds.includes(currentIdFilter) ? [currentIdFilter] : [];
  }

  if (Array.isArray(currentIdFilter)) {
    return currentIdFilter.filter((id) => visibleProductIds.includes(id));
  }

  if (Array.isArray(currentIdFilter.$in)) {
    return currentIdFilter.$in.filter((id) => visibleProductIds.includes(id));
  }

  return visibleProductIds;
};

const applySellerVisibilityAsProductFilter = async (req, _res, next) => {
  try {
    if (!req.filterableFields?.seller) {
      return next();
    }

    if (process.env.CODEX_DISABLE_SELLER_VISIBILITY_FILTER === "true") {
      delete req.filterableFields.seller;
      return next();
    }

    const visibleProductIds = await resolveVisibleSellerProductIds(req);
    req.filterableFields.id = intersectIds(
      req.filterableFields.id,
      visibleProductIds,
    );
    delete req.filterableFields.seller;

    return next();
  } catch (error) {
    return next(error);
  }
};

export default defineMiddlewares({
  routes: [
    {
      method: ["GET"],
      matcher: "/store/products",
      middlewares: [applySellerVisibilityAsProductFilter],
    },
    {
      method: ["GET"],
      matcher: "/store/products/:id",
      middlewares: [applySellerVisibilityAsProductFilter],
    },
  ],
});
