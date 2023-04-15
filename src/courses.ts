import express from "express";
import prisma from "./db";

export const coursesRouter = express.Router();
export const publicCoursesRouter = express.Router();
publicCoursesRouter.get("/", async (req, res) => {
    const courses = await prisma.course.findMany();
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
                courses: {
                    connect: {
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

coursesRouter.post("/new", async (req, res) => {
    if (!req.body.hasOwnProperty("name") ||
        !req.body.hasOwnProperty("people") || isNaN(parseInt(req.body.people)) ||
        !req.body.hasOwnProperty("description") ||
        !req.body.hasOwnProperty("tutor") ||
        !req.body.hasOwnProperty("place"))
        return res.status(400).send({error: "course params not specified"});
    const course = {
        name: req.body.name,
        people: parseInt(req.body.people),
        description: req.body.description,
        tutor: req.body.tutor,
        place: req.body.place,
    };
    const courses = await prisma.course.create({
        data: course
    });
    res.send(courses);
});