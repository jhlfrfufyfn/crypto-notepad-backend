import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AuthRecord {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    @Column()
    username!: string;

    @Column()
    password!: string;
}
