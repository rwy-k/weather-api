import { Router } from "express";
import { getWeather } from "../helpers";

const router = Router();

router.get("/", getWeather);

export default router;