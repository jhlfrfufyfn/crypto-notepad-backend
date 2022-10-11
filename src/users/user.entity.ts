import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Column()
    publicKey!: string;

    @Column({ type: 'text', nullable: true, default: null })
    sessionKey?: string | null;
}
