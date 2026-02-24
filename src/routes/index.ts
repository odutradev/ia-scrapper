import { Router } from "express";

import controlAccess from "@middlewares/controlAccess";
import iaRouter from "./resources/ia.router";

const router = Router();

router.get("/ping", (req, res) => {
    res.sendStatus(200);
});

router.get("/validate/control-access", controlAccess, (req, res) => {
    res.send(`Authorization as "${res.locals.projectID}"`).status(200);
});

router.use("/ia", iaRouter);

export default router;