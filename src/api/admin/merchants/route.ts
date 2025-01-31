import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { UserDTO } from "@medusajs/framework/types";
import { retrieveMerchantsWorkflow } from "src/workflows/retrieve-merchants";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const loggedInUser = req.scope.resolve("loggedInUser") as UserDTO;
  const isSuperAdmin = loggedInUser.metadata?.is_super_admin === true;

  const { result } = await retrieveMerchantsWorkflow(req.scope).run({
    input: {
      userId: isSuperAdmin ? undefined : loggedInUser.id,
      isSuperAdmin,
    },
  });

  res.json({
    merchants: result,
  });
};
