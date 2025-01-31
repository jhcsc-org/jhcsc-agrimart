import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const retrieveVendorsStep = createStep(
  "retrieve-vendors",
  async (_input: void, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: users } = await query.graph({
      entity: "user",
      fields: ["id", "email", "metadata", "user_store_store.store.name"],
      filters: {
        deleted_at: null,
      },
    });

    console.log("Users", users);

    const vendors = users
      .filter((u) => !!u.user_store_store?.length)
      .map((u) => ({
        id: u.id,
        store_name: u.user_store_store[0].store.name,
        user_email: u.email,
        status: "active",
      }));

    console.log("Vendors", vendors);

    return new StepResponse(vendors);
  }
);
