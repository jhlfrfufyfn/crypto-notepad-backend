import express, { Express, Request, Response } from 'express';
import cors from 'cors';
const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

export default app;