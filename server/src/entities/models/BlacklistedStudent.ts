import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Cohort } from "./Cohort";

@Entity("blacklisted_students")
export class BlacklistedStudent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  student_id!: number;

  @Column({ nullable: false })
  cohort_id!: number;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "student_id" })
  student!: User;

  @ManyToOne(() => Cohort)
  @JoinColumn({ name: "cohort_id" })
  cohort!: Cohort;
}