import express from "express";
import prisma from "./db";

export const tutorRouter = express.Router();
tutorRouter.post("/new", async (req, res) => {
    if (!req.body.hasOwnProperty("name") ||
        !req.body.hasOwnProperty("people") || isNaN(parseInt(req.body.people)) ||
        !req.body.hasOwnProperty("description") ||
        !req.body.hasOwnProperty("tutor") ||
        !req.body.hasOwnProperty("place") ||
        !req.body.hasOwnProperty("schedule") ||
        !req.body.hasOwnProperty("requiredDocuments"))
        return res.status(400).send({error: "course params not specified"});
    const course = {
        name: req.body.name,
        people: parseInt(req.body.people),
        description: req.body.description,
        tutor: req.body.tutor,
        place: req.body.place,
        age: req.body.age,
        schedule: req.body.schedule,
        requiredDocuments: req.body.requiredDocuments,
    };
    const newCourse = await prisma.course.create({
        data: course
    });
    res.send(newCourse);
});

tutorRouter.get("/queued", async (req, res) => {
    if (!req.query.hasOwnProperty("course") || isNaN(parseInt(<string>req.query.course)))
        return res.status(400).send({error: "course not specified"});

    const course = await prisma.course.findUnique({
        where: {
            id: parseInt(<string>req.query.course),
        },
        include: {
            queuedUsers: true
        }
    });

    res.send(course?.queuedUsers);
})

tutorRouter.post("/remove", async (req, res) => {
    if (!req.body.hasOwnProperty("course") || isNaN(req.body.course) ||
        !req.body.hasOwnProperty("user") || isNaN(req.body.user))
        return res.status(400).send({error: "course or user not specified"});

    const course = await prisma.course.update({
        where: {
            id: req.body.course,
        },
        data: {
            users: {
                disconnect: {
                    id: req.body.user
                }
            }
        },
        include: {
            users: true
        }
    });

    res.send(course);
})

tutorRouter.post("/add", async (req, res) => {
    if (!req.body.hasOwnProperty("course") || isNaN(req.body.course) ||
        !req.body.hasOwnProperty("user") || isNaN(req.body.user))
        return res.status(400).send({error: "course or user not specified"});

    const user = await prisma.user.update({
        where: {
            id: req.body.user,
        },
        data: {
            courses: {
                connect: {
                    id: req.body.course,
                }
            },
            queuedCourses: {
                disconnect: {
                    id: req.body.course,
                }
            },
        },
        include: {
            courses: true
        }
    });

    res.send(user);
})