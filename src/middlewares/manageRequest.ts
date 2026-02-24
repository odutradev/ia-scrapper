import { Request, Response } from "express";

import { ResponseErrorsParams } from "@assets/config/errors";
import defaultConfig from "@assets/config/default";
import sendError from "@utils/functions/error";
import logger from "@utils/functions/logger";

interface ManageErrorParams {
    code: ResponseErrorsParams;
    error?: any;
}

export interface ManageRequestBody {
    defaultExpress: {
        res: Response;
        req: Request;
    };
    ids:{},
    manageError: (data: ManageErrorParams) => void;
    params: any;
    querys: any;
    data: any;
}

interface ManageRequestParams {
    service: (manageRequestBody: ManageRequestBody) => Promise<any> | any;
}

interface ManageRequestOptionsParams {
    upload?: boolean;
}

const manageRequest = (service: ManageRequestParams["service"], options?: ManageRequestOptionsParams) => {
    return async (req: Request, res: Response) => {

        const manageError = ({ code, error }: ManageErrorParams) => {
            if (res.headersSent) return;
            sendError({ code, error, res, local: service.name });
        };

        try {
            const manageRequestBody: ManageRequestBody = {
                defaultExpress: { res, req },
                params: req.params,
                querys: req.query,
                data: req.body,
                manageError,
                ids: {},
            };

            const result = await service(manageRequestBody);

            if (res.headersSent) return;
            res.set("api-version", defaultConfig.version);
            res.set("api-mode", defaultConfig.mode);
            res.status(200).json(result);
        } catch (error) {
            if (!res.headersSent) {
                logger.error("[manageRequest] Request internal error");
                console.error(error);
                sendError({ code: "internal_error", res });
            }
        }
    };
};

export default manageRequest;