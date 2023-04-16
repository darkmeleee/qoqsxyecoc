import dotenv from 'dotenv';
dotenv.config();
import {authMiddleware} from "./auth";
import {app, apiRouter} from "./routes";
import prisma from "./db";


app.get('/', (req, res) => {
    res.send({
        hello: "world",
    });
});

apiRouter.get('/me', authMiddleware,
    (req, res) => {
        res.send({
            user: req.user
        });
    });

apiRouter.get('/user',
    async (req, res) => {
        if (typeof req.query.id !== "string" || isNaN(parseInt(req.query.id)))
            return res.status(400).send({error: "vk id not passed"});
        const user = await prisma.user.findFirst({
            where: {
                vkId: parseInt(req.query.id) ,
            },
            include: {
                courses: true,
                queuedCourses: true
            }
        });
        if (!user) res.status(404);
        res.send(user ?? {error: "user not found"});
    });
