import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BaseEntity } from "typeorm";
import { Employee } from "./Employee";


@Entity()
export class Sample extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;
    // @Column({
    //     nullable: true
    // })
    // @Column()
    // timestamp: string;
    @Column()
    name: string;

    @Column({ type: "bytea"})
    data;

    @Column()
    description: string;

    @ManyToOne(type => Employee, employee => employee.samples)
    @JoinColumn()
    employee: Employee;
}