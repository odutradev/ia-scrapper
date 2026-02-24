import { Router } from "express";

import manageRequest from "@middlewares/manageRequest";
import iaResource from "@resources/ia/ia.resource";

const iaRouter = Router();

iaRouter.post("/ask", manageRequest(iaResource.ask));


export default iaRouter;