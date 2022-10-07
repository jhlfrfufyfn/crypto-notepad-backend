import { User } from "../users/user.entity";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

@Entity()
export class File {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    @ManyToOne(() => User)
    owner!: User;

    @Column()
    name!: string;

    @Column()
    driveName!: string;
}
