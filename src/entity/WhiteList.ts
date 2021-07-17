import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinColumn, BaseEntity } from "typeorm";
import { Device } from './Device'
import { Employee } from "./Employee";
import { Gallery } from "./Gallery";

@Entity()
export class WhiteList extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    // @Column()
    // role_whitelist: boolean;

    @OneToMany(type => Device, device => device.whitelist)
    devices: Device[];
    @ManyToMany(type => Gallery, gallery => gallery.whitelists)
    // @JoinColumn()
    galleries: Gallery[];
    @ManyToMany(type => Employee, employee => employee.whitelists)
    @JoinColumn()
    employees: Employee[];
}