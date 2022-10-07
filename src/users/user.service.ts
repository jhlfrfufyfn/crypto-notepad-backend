import { User } from "./user.entity";
import { appDataSource } from "../app-data-source";
import { Repository } from "typeorm";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from 'config';
import { Request, Response, NextFunction } from "express"

export interface RequestWithUser extends Request {
    user?: User | null
}

class UserService {
    private userRepository: Repository<User>;
    private salt: string;
    constructor() {
        this.userRepository = appDataSource.getRepository(User);
        this.salt = config.get('jwt.salt');
    }

    async signup(username: string, password: string): Promise<User> {
        if (await this.userRepository.findOneBy({ username })) {
            throw new Error("User already exists");
        }
        const authRecord = new User();
        authRecord.username = username;
        authRecord.password = await this.hashPassword(password);
        return await this.userRepository.save(authRecord);
    }

    async login(username: string, password: string) {
        const authRecord = await this.userRepository.findOneBy({ username });
        if (!authRecord) {
            throw new Error("Username not found");
        }

        if (!(await this.comparePasswords(password, authRecord.password))) {
            throw new Error("Password is incorrect");
        }

        return this.generateToken(authRecord.id);
    }

    async generateToken(userId: string) {
        return jwt.sign({ userId }, config.get('jwt.secret'), { expiresIn: '1d' });
    }

    async hashPassword(password: string): Promise<string> {
        return crypto.pbkdf2Sync(password, this.salt, 100, 64, "sha512").toString("hex");
    }

    async comparePasswords(password: string, hash: string) {
        return await this.hashPassword(password) === hash;
    }

    async getUserById(userId: string) {
        return await this.userRepository.findOneBy({ id: userId });
    }
}
export const userService = new UserService();