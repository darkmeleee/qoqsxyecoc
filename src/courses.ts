import express from "express";
import prisma from "./db";

export const coursesRouter = express.Router();
export const publicCoursesRouter = express.Router();
publicCoursesRouter.get("/", async (req, res) => {
    const courses = await prisma.course.findMany({
        include: {
            users: true,
            queuedUsers: true,
        },
        orderBy: {
            id: 'asc'
        }
    });
    res.send(courses);
});

publicCoursesRouter.get("/course/:id", async (req, res) => {
    if (typeof req.params.id !== "string" || isNaN(parseInt(req.params.id)))
        return res.status(400).send({error: "course not passed"});
    const course = await prisma.course.findFirst({
        where: {
            id: parseInt(req.params.id),
        },
    });
    let attending = 0;
    let queued = 0;
    if (typeof req.query.user === "string" && !isNaN(parseInt(req.query.user))) {
        attending = await prisma.user.count({
            where: {
                id: parseInt(req.query.user),
                courses: {
                    some: {
                        id: parseInt(req.params.id),
                    }
                }
            }
        });
        queued = await prisma.user.count({
            where: {
                id: parseInt(req.query.user),
                queuedCourses: {
                    some: {
                        id: parseInt(req.params.id),
                    }
                }
            }
        });
    }

    if (course === null) {
        return res.status(404).send({error: "course not found"});
    }
    res.send({...course, attending: attending > 0, queued: queued > 0});
});

coursesRouter.get("/attending", async (req, res) => {
    const me = await prisma.user.findUnique({
        where: {
            id: req.user?.id
        },
        include: {
            courses: {
                include: {
                    users: true,
                    queuedUsers: true,
                }
            },
        }
    });
    res.send(me?.courses);
});

coursesRouter.post("/attend", async (req, res) => {
    if (!req.body.hasOwnProperty("course"))
        return res.status(400).send({error: "course not specified"});
    try {
        const user = await prisma.user.count({
            where: {
                id: req.user?.id,
                courses: {
                    some: {
                        id: req.body.course,
                    }
                }
            }
        });

        if(user > 0) return res.status(400).send({error: "already attending"});
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