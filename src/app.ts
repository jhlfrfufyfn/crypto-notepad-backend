import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import 'reflect-metadata';
import jwt from 'jsonwebtoken'; 
import { appDataSource } from './app-data-source';
import userRouter from './users/user.routes';
import { authenticateToken, RequestWithUser, userService } from './users/user.service';
import fileRouter from './files/file.routes';
import config from 'config';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));
app.use('/static', express.static(path.join('..', 'public')));

app.use('/api/auth', userRouter);
app.use(authenticateToken);

app.use('/api/files', fileRouter);

appDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    });

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

export default app;