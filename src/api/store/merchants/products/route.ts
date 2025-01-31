import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { IProductModuleService } from "@medusajs/framework/types";

type QueryParams = {
  handle?: string;
  id?: string;
};

export async function GET(
  req: MedusaRequest<unknown, QueryParams>,
  res: MedusaResponse
): Promise<void> {
  const { handle, id } = req.query;

  if (!handle && !id) {
    res.status(400).json({ message: "Either handle or id must be provided" });
    return;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const productService: IProductModuleService = req.scope.resolve(
    Modules.PRODUCT
  );

  try {
    // 1. Get the product
    const products = await productService.listProducts(
      {
        ...(handle && typeof handle === "string" ? { handle } : {}),
        ...(id && typeof id === "string" ? { id } : {}),
      },
      {
        relations: [
          "collection",
          "categories",
          "variants",
          "type",
          "tags",
          "options",
          "options.values",
          "images",
        ],
        select: [
          "id",
          "title",
          "subtitle",
          "status",
          "external_id",
          "description",
          "handle",
          "is_giftcard",
          "discountable",
          "thumbnail",
          "collection_id",
          "type_id",
          "weight",
          "length",
          "height",
          "width",
          "hs_code",
          "origin_country",
          "mid_code",
          "material",
          "created_at",
          "updated_at",
          "deleted_at",
          "metadata",
        ],
      }
    );

    if (!products.length) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const product = products[0];

    // 2. Get the store information through product_store relation
    const { data: productStores } = await query.graph({
      entity: "product_store",
      fields: ["store_id"],
      filters: {
        product_id: product.id,
      },
    });

    if (!productStores.length) {
      res.status(404).json({ message: "Store not found for this product" });
      return;
    }

    const storeId = productStores[0].store_id;

    // 3. Get the merchant (user) information through the store
    const { data: stores } = await query.graph({
      entity: "store",
      fields: ["id", "name", "owner_id"],
      filters: {
        id: storeId,
      },
    });

    if (!stores.length) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    const store = stores[0];

    // 4. Get the user (merchant) information
    const { data: users } = await query.graph({
      entity: "user",
      fields: ["id", "email", "metadata"],
      filters: {
        id: store.owner_id,
      },
    });

    if (!users.length) {
      res.status(404).json({ message: "Merchant not found" });
      return;
    }

    const merchant = {
      id: users[0].id,
      store_name: store.name,
      user_email: users[0].email,
      status: users[0].metadata?.status || "active",
      store: store,
    };

    res.json({
      product,
      merchant,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
