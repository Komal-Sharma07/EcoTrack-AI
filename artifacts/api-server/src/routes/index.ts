import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import footprintRouter from "./footprint";
import entriesRouter from "./entries";
import recommendationsRouter from "./recommendations";
import badgesRouter from "./badges";
import tipsRouter from "./tips";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(footprintRouter);
router.use(entriesRouter);
router.use(recommendationsRouter);
router.use(badgesRouter);
router.use(tipsRouter);
router.use(statsRouter);

export default router;
