import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { retrieveMerchantsWorkflow } from "src/workflows/retrieve-merchants";

type QueryParams = {
  id?: string | string[];
  status?: string;
  store_name?: string;
};

export async function GET(
  req: MedusaRequest<unknown, QueryParams>,
  res: MedusaResponse
): Promise<void> {
  const { id, status, store_name } = req.query;

  const filters: any = {};
  if (id) {
    filters.id =
      typeof id === "string"
        ? [id]
        : Array.isArray(id)
        ? id.map(String)
        : undefined;
  }
  if (status && typeof status === "string") {
    filters.status = status;
  }
  if (store_name && typeof store_name === "string") {
    filters.store_name = store_name;
  }

  const { result } = await retrieveMerchantsWorkflow(req.scope).run({
    input: {
      isSuperAdmin: false,
      filters,
    },
  });

  res.json({
    merchants: result,
  });
}
