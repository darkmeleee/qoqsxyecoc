import express, {Express} from "express";
import bodyParser from "body-parser";
import {authMiddleware, authRouter} from "./auth";

import passport from "passport";

import cors from "cors";

export const app: Express = express();

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT;

export const apiRouter = express.Router();


app.use("/api", apiRouter);

app.listen(port, () => {
    console.log(`Listening on ${port}`);
})