import { AuthRecord } from "./auth-record.entity";
import { appDataSource } from "../app-data-source";
import { Repository, UsingJoinTableIsNotAllowedError } from "typeorm";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from 'config';
import { Request, Response, NextFunction } from "express"

export interface RequestWithUser extends Request {
    user?: AuthRecord | null
}

class AuthService {
    private authRepository: Repository<AuthRecord>;
    private salt: string;
    constructor() {
        this.authRepository = appDataSource.getRepository(AuthRecord);
        this.salt = crypto.randomBytes(16).toString('hex');
    }

    async signup(username: string, password: string): Promise<AuthRecord> {
        const authRecord = new AuthRecord();
        authRecord.username = username;
        authRecord.password = await this.hashPassword(password);
        return await this.authRepository.save(authRecord);
    }

    async login(username: string, password: string) {
        const authRecord = await this.authRepository.findOneBy({ username });

        if (!authRecord) {
            throw new Error("Username not found");
        }

        if (!(await this.comparePasswords(password, authRecord.password))) {
            throw new Error("Password is incorrect");
        }

        return authRecord;
    }

    async generateToken(userId: string) {
        return jwt.sign({ userId }, config.get('jwt.secret'), { expiresIn: '1d' });
    }

    async authenticateToken(req: RequestWithUser, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token === undefined) {
            return res.sendStatus(401);
        }
        jwt.verify(token, config.get('jwt.secret'), async (err, decoded) => {
            console.log(decoded);
            if (err) {
                return res.sendStatus(403);
            }
            decoded = decoded?.toString();
            const authRecord = await this.authRepository.findOneBy({ id: decoded });
            req.user = authRecord;
            next();
        });
    };

    async hashPassword(password: string): Promise<string> {
        return crypto.pbkdf2Sync(password, this.salt, 100, 64, "sha512").toString("hex");
    }

    async comparePasswords(password: string, hash: string) {
        return await this.hashPassword(password) === hash;
    }
}
export const authService = new AuthService();