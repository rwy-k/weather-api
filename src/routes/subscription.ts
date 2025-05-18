import { Router } from "express";
import { addNewSubscription, confirmSubscription, unsubscribe } from "../helpers";

const router = Router();

router.post("/subscribe", addNewSubscription);
router.get("/confirm/:token", confirmSubscription);
router.get("/unsubscribe/:token", unsubscribe);

export default router;