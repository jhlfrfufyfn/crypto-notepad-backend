import { appDataSource } from "../app-data-source";
import { Repository } from "typeorm";

import crypto from 'crypto';
import config from 'config';
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { User } from "../users/user.entity";
import { File } from "./file.entity";

class FileService {
    private readonly fileRepository: Repository<File>;
    private readonly iv: Buffer;
    constructor() {
        this.fileRepository = appDataSource.getRepository(File);
        this.iv = crypto.randomBytes(16);
    }

    private getPathToFile(file: File) {
        return path.join(__dirname, '..', '..', 'public', file.driveName);
    }

    async getFilesOfUser(userId: string) {
        return (
            await this.fileRepository.
                createQueryBuilder("file")
                .leftJoin("file.owner", "owner")
                .where("owner.id = :userId", { userId })
                .getMany()
        );
    }

    async getFile(userId: string, fileId: string) {
        return (
            await this.fileRepository.
                createQueryBuilder("file")
                .leftJoin("file.owner", "owner")
                .where("owner.id = :userId", { userId })
                .andWhere("file.id = :fileId", { fileId })
                .getOne()
        );
    }


    async getFileContent(file: File) {
        let text = await fs.readFile(this.getPathToFile(file), "utf-8");
        ///text = await this.decrypt(text)
        return text;
    }

    async createFile({ owner, name }: { owner: User, name: string }): Promise<File> {
        const file = new File();
        file.name = name;
        file.owner = owner;
        file.driveName = uuidv4();

        const filePath = this.getPathToFile(file)
        try {
            await this.updateFileContent(file, '');
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
                throw new Error('Could not create file');
            }
            else {
                throw new Error("Could not create file; ");
            }
        }

        return await this.fileRepository.save(file);
    }

    async encrypt(text: string) {
        console.log(1);
        console.log(Buffer.from(config.get('file.secret')).length);
        let cipher = crypto.createCipheriv('aes-256-cfb', Buffer.from(config.get('file.secret')), this.iv);
        console.log(2);
        let encrypted = cipher.update(text);
        console.log(3);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        console.log(4);
        return encrypted.toString('hex');
    }

    async decrypt(text: string) {
        let encryptedText = Buffer.from(text, 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cfb', Buffer.from(config.get('file.secret')), this.iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    async updateFileContent(file: File, text: string) {
        const filePath = this.getPathToFile(file);
        ///text = await this.encrypt(text);
        await fs.writeFile(filePath, text, "utf-8");
    }

    async deleteFile(file: File) {
        const filePath = this.getPathToFile(file);
        await fs.unlink(filePath);
        await this.fileRepository.delete(file.id);
    }
}
const fileService = new FileService();

export default fileService;