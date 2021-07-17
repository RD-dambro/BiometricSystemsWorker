import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinColumn, BaseEntity } from "typeorm";
import { Gallery } from "./Gallery";
import { Sample } from "./Sample";
import { WhiteList } from "./WhiteList";


@Entity()
export class Employee extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @ManyToMany(type => Gallery, gallery => gallery.employees)ù
    // @JoinColumn()
    galleries: Gallery[];
    @OneToMany(type => Sample, sample => sample.employee)
    samples: Sample[];
    @ManyToMany(type => WhiteList, whitelist => whitelist.employees)
    whitelists: WhiteList[];
}