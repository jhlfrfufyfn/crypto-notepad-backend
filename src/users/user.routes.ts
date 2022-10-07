import express from "express";
import { userService } from "./user.service";

const userRouter = express.Router();

userRouter.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    try {
        await userService.signup(username, password);
        res.send({ message: `User ${username} created` });
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).send(err.message);
        }
        else {
            res.status(400).send('error');
        }
    }
});

userRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const token = await userService.login(username, password);
        res.send({ token });
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).send(err.message);
        }
        else {
            res.status(400).send('error');
        }
    }
});

export default userRouter;
