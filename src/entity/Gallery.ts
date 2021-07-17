import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, BaseEntity } from "typeorm";
import { Employee } from "./Employee";
import { WhiteList } from "./WhiteList";


@Entity()
export class Gallery extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    // @Column({
    //     length: 100
    // })

    @Column()
    name: string;

    @Column()
    description: string;

    @ManyToMany(type => WhiteList, whitelist => whitelist.galleries)
    whitelists: WhiteList[];
    @ManyToMany(type => Employee, employee => employee.galleries)
    employees: Employee[];
}