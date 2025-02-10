import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { CohortAssignment } from "./CohortAssignment";

@Entity("cohorts")
export class Cohort {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255, nullable: false })
  name!: string;

  @Column({ nullable: false })
  created_by!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  averageMood?: number;

  @ManyToOne(() => User, user => user.createdCohorts)
  @JoinColumn({ name: "created_by" })
  creator!: User;

  @OneToMany(() => CohortAssignment, assignment => assignment.cohort)
  assignments!: CohortAssignment[];
}