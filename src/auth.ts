import passport from 'passport';
import prisma from "./db";
import bcrypt from "bcrypt";
import * as crypto from "crypto";
import express from "express";
import { User } from '@prisma/client';
import {Strategy as BearerStrategy} from "passport-http-bearer";
import {Strategy as CustomStrategy} from "passport-custom";


type ExpressUser = User;

declare global {
    namespace Express {
        interface User extends ExpressUser {}
    }
}


export const authRouter = express.Router();



passport.use('token',
    new BearerStrategy(
        async (userToken, done) => {
            const token = await prisma.accessToken.findFirst({
                where: {
                    token: userToken,
                }
            });
            if (token === null) return done(null, false);
            const user = await prisma.user.findFirst({
                where: {
                    id: token.userId
                }
            });
            if (user === null) return done(null, false);
            done(null, user);
        }
    ));

passport.use('body',
    new CustomStrategy(
        async (req, done) => {
            if (!req.body.hasOwnProperty("username") ||
                !req.body.hasOwnProperty("password"))
                return done(null, false);
            const user = await prisma.user.findFirst({
                where: {
                    email: req.body.username,
                }
            });
            if (user === null) return done(null, false);
            if (await bcrypt.compare(req.body.password, user.password)) {
                done(null, user);
            } else {
                done(null, false);
            }
        }
    ));



authRouter.post("/login",
    passport.authenticate("body", {session: false}),
    async (req, res) => {
    if(!req.user) return res.sendStatus(500);
    const tokenString = crypto.randomBytes(64).toString('hex');
    const token = await prisma.accessToken.create({
        data: {
            token: tokenString,
            userId: req.user.id,
        }
    });
    res.send({
        token: token.token,
    });
});

export const authMiddleware = passport.authenticate("token", { session: false });