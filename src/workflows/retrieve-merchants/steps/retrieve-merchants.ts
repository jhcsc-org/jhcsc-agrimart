import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export type RetrieveMerchantsStepInput = {
  userId?: string;
  isSuperAdmin: boolean;
  filters?: {
    id?: string[];
    status?: string;
    store_name?: string;
  };
};

export const retrieveMerchantsStep = createStep(
  "retrieve-merchants",
  async (
    { userId, isSuperAdmin, filters }: RetrieveMerchantsStepInput,
    { container }
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: users } = await query.graph({
      entity: "user",
      fields: ["id", "email", "store.id", "store.name", "metadata"],
      filters: {
        ...(userId ? { id: userId } : {}),
        ...(filters?.id ? { id: filters.id } : {}),
        ...(filters?.store_name
          ? {
              "store.name": {
                $ilike: `%${filters.store_name}%`,
              },
            }
          : {}),
      },
    });

    const merchants = users
      .filter((u) => !!u.store)
      .filter((u) => !filters?.status || u.metadata?.status === filters.status)
      .map((u) => ({
        id: u.id,
        store_name: u.store.name,
        user_email: u.email,
        status: u.metadata?.status || "active",
        can_impersonate: isSuperAdmin,
        store: u.store,
      }));

    return new StepResponse(merchants);
  }
);
