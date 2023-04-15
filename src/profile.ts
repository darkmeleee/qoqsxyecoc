import express from "express";
import prisma from "./db";

export const profileRouter = express.Router();

profileRouter.post("/update", async (req, res) => {
    let update: any = {};

    if(req.body.hasOwnProperty("name")) {
        update["name"] = req.body.name;
    }

    if(req.body.hasOwnProperty("email")) {
        update["email"] = req.body.email;
    }

    if(req.body.hasOwnProperty("lastname")) {
        update["lastname"] = req.body.lastname;
    }

    if(req.body.hasOwnProperty("surname")) {
        update["surname"] = req.body.surname;
    }

    if(req.body.hasOwnProperty("birthdate") && !isNaN(parseInt(req.body.birthdate))) {
        update["birthdate"] = new Date(parseInt(req.body.birthdate));
    }
    const user = await prisma.user.update({
        where: {
            id: req.user?.id,
        },
        data: update
    });
    res.send(user);
})
