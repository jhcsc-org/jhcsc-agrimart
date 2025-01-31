import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { retrieveMerchantsStep } from "./steps/retrieve-merchants";

export type RetrieveMerchantsInput = {
  userId?: string;
  isSuperAdmin?: boolean;
  filters?: {
    id?: string[];
    status?: string;
    store_name?: string;
  };
};

export type MerchantItem = {
  id: string;
  store_name: string;
  user_email: string;
  status: "active" | "inactive";
  can_impersonate: boolean;
  store: any;
};

export type MerchantsResponse = {
  merchants: MerchantItem[];
};

export const retrieveMerchantsWorkflow = createWorkflow(
  "retrieve-merchants",
  ({ userId, isSuperAdmin = false, filters }: RetrieveMerchantsInput = {}) => {
    const merchants = retrieveMerchantsStep({
      userId,
      isSuperAdmin,
      filters,
    });
    return new WorkflowResponse(merchants);
  }
);
