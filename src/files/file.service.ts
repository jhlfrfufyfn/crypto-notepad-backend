import { appDataSource } from "../app-data-source";
import { Repository } from "typeorm";

import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4} from "uuid";
import { User } from "../users/user.entity";
import { File } from "./file.entity";

class FileService {
    private readonly fileRepository: Repository<File>;
    constructor() {
        this.fileRepository = appDataSource.getRepository(File);
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
        const text = await fs.readFile(this.getPathToFile(file), "utf-8");
        return text;
    }

    async createFile({ owner, name }: { owner: User, name: string }): Promise<File> {
        const file = new File();
        file.name = name;
        file.owner = owner;
        file.driveName = uuidv4();

        const filePath = this.getPathToFile(file)
        try {
            await fs.writeFile(filePath, "");
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

    async updateFileContent(file: File, text: string) {
        const filePath = this.getPathToFile(file);
        await fs.writeFile(filePath, text, "utf-8");
    }

    async deleteFile(file: File) {
        const filePath = this.getPathToFile(file);
        await fs.unlink(filePath);
        await this.fileRepository.delete(file);
    }
}
const fileService = new FileService();

export default fileService;