import { Client } from "minio";
import express from "express";
import multer, {FileFilterCallback} from "multer";
import path from "path";
import prisma from "./db";

export const s3 = new Client({
    endPoint: 's3.gesti.tech',
    port: 443,
    useSSL: true,
    accessKey: 'test',
    secretKey: 'test'
});

export const docsRouter = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req: any, file: Express.Multer.File, callback: FileFilterCallback) => {
        if (!["application/pdf", "image/png", "image/jpeg"].includes(file.mimetype)) {
            return callback(new Error("Only pdf/jpg/png should be passed"))
        }
        callback(null, true)
    }
})
docsRouter.post("/upload", upload.single('file'), async (req, res) => {
    if (!req.body.course || isNaN(parseInt(req.body.course))) return res.status(400).send({error: "course not passed"});
    if (!req.file) return res.status(400).send({error: "file not passed"});

    const course = await prisma.course.findUnique({
        where: {
            id: parseInt(req.body.course),
        },
    });
    if (!course) return res.status(404).send({error: "course not found"});
    if (!course.requiredDocuments.includes(req.body.name)) return res.status(400).send({error: "unknown document passed"});

    const key = `${course.name}/${req.user?.lastname}_${req.user?.name}_${req.body.name}${path.extname(req.file.originalname)}`;

    await s3.putObject("docs", key, req.file.buffer);
    await prisma.documentUpload.deleteMany({
       where: {
           courseId: parseInt(req.body.course),
           userId: req.user?.id,
           name: req.body.name,
       }
    });

    res.send(await prisma.documentUpload.create({
        data: {
            courseId: parseInt(req.body.course),
            userId: req.user?.id ?? 0,
            name: req.body.name,
            key,
        }
    }));
});

docsRouter.get("/course", async (req, res) => {
    if (typeof req.query.course !== "string" || isNaN(parseInt(req.query.course)))
        return res.status(400).send({error: "course not passed"});

    res.send(await prisma.documentUpload.findMany({
        where: {
            courseId: parseInt(req.query.course),
            userId: req.user?.id,
        }
    }));
});

export const docsPublicRouter = express.Router();

docsPublicRouter.get("/download/:object", async (req, res) => {
    try {
        const object = await s3.getObject("docs", req.params.object);

        object.pipe(res);
    } catch (e) {
        res.status(404).send({error: "not found"});
    }
});