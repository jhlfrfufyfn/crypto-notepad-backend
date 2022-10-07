import { DataSource } from "typeorm";
import config from "config";
import path from 'node:path';

export const appDataSource = new DataSource({
    type: "postgres",
    host: config.get('db.host'),
    port: config.get('db.port'),
    username: config.get('db.username'),
    password: config.get('db.password'),
    database: config.get('db.database'),
    entities: [path.join(__dirname, "**/*.entity.ts")],
    synchronize: process.env.NODE_ENV !== "production",
    logging: process.env.NODE_ENV !== "production",
    logger: 'file'
});
