import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { retrieveVendorsStep } from "./steps/retrieve-vendors";

export type VendorItem = {
  id: string;
  store_name: string;
  user_email: string;
  status: "active" | "inactive";
};

export type VendorsResponse = {
  vendors: VendorItem[];
};

export const retrieveVendorsWorkflow = createWorkflow(
  "retrieve-vendors",
  () => {
    const vendors = retrieveVendorsStep();
    return new WorkflowResponse(vendors);
  }
);
