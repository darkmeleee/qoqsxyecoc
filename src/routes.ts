import express, {Express} from "express";
import bodyParser from "body-parser";
import {authMiddleware, authRouter} from "./auth";

import passport from "passport";

import cors from "cors";
import {coursesRouter, publicCoursesRouter} from "./courses";

export const app: Express = express();

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT;

export const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/courses", publicCoursesRouter);
apiRouter.use("/courses", authMiddleware, coursesRouter);
app.use("/api", apiRouter);

app.listen(port, () => {
    console.log(`Listening on ${port}`);
})