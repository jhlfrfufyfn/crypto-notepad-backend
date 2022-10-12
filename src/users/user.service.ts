import { User } from "./user.entity";
import { appDataSource } from "../app-data-source";
import { Repository } from "typeorm";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from 'config';
import { Request, Response, NextFunction } from "express";
import { encrypt } from 'eciesjs';

export interface RequestWithUser extends Request {
    user?: User | null
}
export async function authenticateToken(req: RequestWithUser, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === undefined) {
        return res.sendStatus(401);
    }
    jwt.verify(token, config.get('jwt.secret'), async (err, decoded) => {
        if (!decoded || typeof decoded === 'string' || decoded.userId === undefined) {
            return res.sendStatus(401);
        }
        if (err) {
            next(err);
        }
        const authRecord = await userService.getUserById(decoded.userId);
        req.user = authRecord;
        next();
    });
}
class UserService {

    private userRepository: Repository<User>;
    private salt: string;
    constructor() {
        this.userRepository = appDataSource.getRepository(User);
        this.salt = config.get('jwt.salt');
    }

    async signup(username: string, password: string, publicKey: string): Promise<User> {
        if (await this.userRepository.findOneBy({ username })) {
            throw new Error("User already exists");
        }
        const user = new User();
        user.username = username;
        user.password = await this.hashPassword(password);
        if (publicKey.length < 33) {
            throw new Error("Invalid public key");
        }
        user.publicKey = publicKey;
        return await this.userRepository.save(user);
    }

    async login(username: string, password: string) {
        const user = await this.userRepository.findOneBy({ username });
        if (!user) {
            throw new Error("Username not found");
        }

        if (!(await this.comparePasswords(password, user.password))) {
            throw new Error("Password is incorrect");
        }

        const sessionKey = this.generateSessionKey();
        await this.userRepository.update(user.id, { sessionKey });

        const encSessionKey = encrypt(user.publicKey, Buffer.from(sessionKey)).toString('hex');
        return { token: this.generateToken(user.id, encSessionKey), userId: user.id, encSessionKey };
    }

    generateToken(userId: string, sessionKey: string) {
        return jwt.sign({ userId, sessionKey }, config.get('jwt.secret'), { expiresIn: '1d' });
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

    generateSessionKey() {
        return crypto.randomBytes(64).toString('hex');
    }

    async encryptText(text: string, sessionKey: string) {
        const cipher = crypto.createCipheriv('aes-256-cfb', Buffer.from(sessionKey), null);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return encrypted.toString('hex');
    }

    async decryptText(encryptedText: string, sessionKey: string) {
        const encrypted = Buffer.from(encryptedText, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cfb', Buffer.from(sessionKey), null);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString();
    }

}
export const userService = new UserService();