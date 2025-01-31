import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import {
  retrieveVendorsWorkflow,
  VendorsResponse,
} from "src/workflows/retrieve-vendors";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse<VendorsResponse>
): Promise<void> {
  const { result } = await retrieveVendorsWorkflow(req.scope).run();

  res.json({
    vendors: result,
  });
}
