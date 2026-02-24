import { processVerificationCode, enableAnonymousMode, sendPromptToAI, getAIResponseText, resetPage } from "./ia.service";
import { CODE_LENGTH } from "./ia.constants";

import type { ManageRequestBody } from "@middlewares/manageRequest";

const iaResource = {
    verify: async ({ manageError, data }: ManageRequestBody) => {
        const { code } = data;
        if (!code || code.length !== CODE_LENGTH) return manageError({ code: "invalid_data" });
        const isVerified = await processVerificationCode(code);
        if (!isVerified) return manageError({ code: "internal_error" });
        await enableAnonymousMode();
        return { success: true };
    },
    ask: async ({ manageError, data }: ManageRequestBody) => {
        const { prompt } = data;
        if (!prompt) return manageError({ code: "invalid_data" });
        const isSent = await sendPromptToAI(prompt);
        if (!isSent) return manageError({ code: "internal_error" });
        const responseText = await getAIResponseText();
        if (!responseText) return manageError({ code: "internal_error" });
        await resetPage();
        return { success: true, data: responseText };
    }
};

export default iaResource;