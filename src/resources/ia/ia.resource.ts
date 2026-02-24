import type { ManageRequestBody } from "@middlewares/manageRequest";

const iaResource = {
    ask: async ({ manageError }: ManageRequestBody) => {
        try {
          
        } catch (error) {
            manageError({ code: "internal_error", error });
        }
    }
};

export default iaResource;