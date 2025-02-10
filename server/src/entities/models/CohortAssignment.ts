import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Cohort } from "./Cohort";

@Entity("cohort_assignments")
export class CohortAssignment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  user_id!: number;

  @Column({ nullable: false })
  cohort_id!: number;

  @CreateDateColumn({ name: "assigned_at" })
  assigned_at!: Date;

  @ManyToOne(() => User, user => user.cohortAssignments)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Cohort, cohort => cohort.assignments)
  @JoinColumn({ name: "cohort_id" })
  cohort!: Cohort;
}