import express from "express";
import { authService } from "./auth.service";

const authRouter = express.Router();

authRouter.post("/signup", (req, res) => {
    const { username, password } = req.body;
    authService.signup(username, password);
});

authRouter.post("/login", (req, res) => {

});

export default authRouter;
