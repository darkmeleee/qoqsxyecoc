import express, {Express} from "express";
import bodyParser from "body-parser";
import {authMiddleware, authRouter, tutorMiddleware} from "./auth";

import passport from "passport";

import cors from "cors";
import {coursesRouter, publicCoursesRouter} from "./courses";
import {tutorRouter} from "./tutor";
import {profileRouter} from "./profile";
import {docsRouter} from "./docs";

export const app: Express = express();

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT;

export const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/courses", publicCoursesRouter);
apiRouter.use("/courses", authMiddleware, coursesRouter);
apiRouter.use("/profile", authMiddleware, profileRouter);
apiRouter.use("/docs", authMiddleware, docsRouter);
coursesRouter.use("/tutor", tutorMiddleware, tutorRouter);
app.use("/api", apiRouter);

app.listen(port, () => {
    console.log(`Listening on ${port}`);
})