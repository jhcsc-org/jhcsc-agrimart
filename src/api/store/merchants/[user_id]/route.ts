import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { IProductModuleService } from "@medusajs/framework/types";
import { retrieveMerchantsWorkflow } from "src/workflows/retrieve-merchants";

type QueryParams = {
  id?: string | string[];
  status?: string;
};

export async function GET(
  req: MedusaRequest<unknown, QueryParams>,
  res: MedusaResponse
): Promise<void> {
  const { user_id } = req.params;
  const { id, status } = req.query;

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const productService: IProductModuleService = req.scope.resolve(
    Modules.PRODUCT
  );

  try {
    // 1. Get the merchant information
    const { result: merchants } = await retrieveMerchantsWorkflow(
      req.scope
    ).run({
      input: {
        userId: user_id,
        filters: {
          id:
            typeof id === "string"
              ? [id]
              : Array.isArray(id)
              ? id.map(String)
              : undefined,
          status: typeof status === "string" ? status : undefined,
        },
      },
    });

    if (!merchants.length) {
      res.status(404).json({ message: "Merchant not found" });
      return;
    }

    const merchant = merchants[0];
    const storeId = merchant.store.id;

    // 2. Get products linked to the store
    const { data: productLinks } = await query.graph({
      entity: "product_store",
      fields: ["product_id"],
      filters: {
        store_id: storeId,
      },
    });

    const productIds = productLinks.map((link) => link.product_id);

    // 3. Get full product details with all relations
    const products = await productService.listProducts(
      {
        id: productIds,
      },
      {
        relations: [
          "collection",
          "collection.products",
          "categories",
          "categories.category_children",
          "categories.parent_category",
          "categories.products",
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
        take: 20,
        skip: 0,
      }
    );

    // Get total count
    const count = products.length;

    res.json({
      merchant,
      products,
      count,
      offset: 0,
      limit: 20,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
