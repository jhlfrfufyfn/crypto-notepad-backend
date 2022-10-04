import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import 'reflect-metadata';

import { appDataSource } from './app-data-source';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));
app.use('/static', express.static(path.join('..', 'public')));

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