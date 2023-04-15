import passport from 'passport';
import prisma from "./db";
import express, {Request} from "express";
import { User } from '@prisma/client';
import {Strategy as BearerStrategy} from "passport-http-bearer";
import {Strategy as CustomStrategy} from "passport-custom";
import axios from "axios";
import {apiRouter} from "./routes";

type ExpressUser = User;

declare global {
    namespace Express {
        interface User extends ExpressUser {}
    }
}


export const authRouter = express.Router();

const instance = axios.create({
    baseURL: 'https://api.vk.com/method',
    timeout: 1000
});

passport.use('token',
    new BearerStrategy({passReqToCallback: true},
        async (req: Request, userToken: string, done: any) => {
            const data = {
                v: '5.131',
                token: userToken,
                access_token: process.env.VK_TOKEN
            };

            const response = await instance.get("/secure.checkToken", {
                params: data
            });

            if (response.data.response?.success !== 1) return done(null, false);
            const user = await prisma.user.findFirst({
                where: {
                    vkId: response.data.id,
                }
            });
            if (user) return done(null, user);
            if (!req.body.hasOwnProperty("email"))
                return done(null, false);

            const userInfo = (await instance.get("/users.get", {
                params: {
                    v: '5.131',
                    access_token: userToken
                }
            })).data.response[0];

            const newUser = await prisma.user.create({
                data: {
                    email: req.body.email,
                    name: userInfo.first_name,
                    lastname: userInfo.last_name,
                    vkId: userInfo.id,
                }
            })
            return done(null, newUser);
        }
    ));

export const authMiddleware = passport.authenticate("token", { session: false });

authRouter.post('/mail', authMiddleware,
    (req, res) => {
        res.send(req.user);
    });