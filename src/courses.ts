import express from "express";
import prisma from "./db";

export const coursesRouter = express.Router();
export const publicCoursesRouter = express.Router();
publicCoursesRouter.get("/", async (req, res) => {
    const courses = await prisma.course.findMany({
        include: {
            users: true,
            queuedUsers: true,
        }
    });
    res.send(courses);
});

coursesRouter.get("/attending", async (req, res) => {
    const me = await prisma.user.findUnique({
        where: {
            id: req.user?.id
        },
        include: {
            courses: true,
        }
    });
    res.send(me?.courses);
});

coursesRouter.post("/attend", async (req, res) => {
    if (!req.body.hasOwnProperty("course"))
        return res.status(400).send({error: "course not specified"});
    try {
        const me = await prisma.user.update({
            where: {
                id: req.user?.id
            },
            data: {
                queuedCourses: {
                    connect: {
                        id: req.body.course
                    }
                },
            },
            include: {
                courses: true,
                queuedCourses: true
            }
        });
        res.send(me);
    } catch (e) {
        res.status(404).send({error: "course not found"});
    }
});

coursesRouter.post("/unattend", async (req, res) => {
    if (!req.body.hasOwnProperty("course"))
        return res.status(400).send({error: "course not specified"});
    try {
        const me = await prisma.user.update({
            where: {
                id: req.user?.id
            },
            data: {
                queuedCourses: {
                    disconnect: {
                        id: req.body.course
                    }
                },
                courses: {
                    disconnect: {
                        id: req.body.course
                    }
                },
            },
            include: {
                courses: true
            }
        });
        res.send(me);
    } catch (e) {
        res.status(404).send({error: "course not found"});
    }
});