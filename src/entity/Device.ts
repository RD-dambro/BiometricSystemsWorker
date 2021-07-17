import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, BaseEntity, JoinColumn } from "typeorm";
import { WhiteList } from './WhiteList'



@Entity()
export class Device extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    // @Column()
    // role_whitelist: boolean;

    @ManyToOne(type => WhiteList, whitelist => whitelist.devices)
    @JoinColumn()
    whitelist: WhiteList;
}