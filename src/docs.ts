import { Client } from "minio";
import express from "express";
import multer, {FileFilterCallback} from "multer";
import crypto from "crypto";
import path from "path";

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
    if (!req.file) return res.status(400).send({error: "file not passed"});
    const token = crypto.randomBytes(8).toString('hex');
    const filetype = path.extname(req.file.originalname);

    await s3.putObject("docs", token+filetype, req.file?.buffer)
    res.send("https://s3.gesti.tech/docs/"+token+filetype);
})