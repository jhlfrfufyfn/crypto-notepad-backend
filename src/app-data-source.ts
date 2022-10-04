import { DataSource } from "typeorm";
import config from "config";

console.log("config host has", config.has("db.host"));
console.log("config host", config.get("db.host"));

export const appDataSource = new DataSource({
    type: "postgres",
    host: config.get('db.host'),
    port: config.get('db.port'),
    username: config.get('db.username'),
    password: config.get('db.password'),
    database: config.get('db.database'),
    entities: [__dirname + "*.entuty.ts"],
    synchronize: process.env.NODE_ENV !== "production",
    logging: process.env.NODE_ENV !== "production",
});
