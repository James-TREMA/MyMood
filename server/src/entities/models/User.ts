import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { MoodScore } from "./MoodScore";
import { Alert } from "./Alert";
import { CohortAssignment } from "./CohortAssignment";
import { Cohort } from "./Cohort";
import { MoodHistory } from "./MoodHistory";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255, nullable: false })
  name!: string;

  @Column({ length: 255, unique: true, nullable: false })
  email!: string;

  @Column({ length: 255, nullable: false })
  password!: string;

  @Column({
    type: "enum",
    enum: ["student", "supervisor", "admin"],
    nullable: false
  })
  role!: "student" | "supervisor" | "admin";

  @Column('jsonb', { nullable: true })
  preferences?: {
    dailyReminders: boolean;
    emailNotifications: boolean;
  };

  @Column({ type: 'integer', nullable: true })
  last_mood?: number;

  @OneToMany(() => MoodScore, moodScore => moodScore.user)
  moodScores!: MoodScore[];

  @OneToMany(() => Alert, alert => alert.user)
  alerts!: Alert[];

  @OneToMany(() => Alert, alert => alert.supervisor)
  supervisedAlerts!: Alert[];

  @OneToMany(() => CohortAssignment, assignment => assignment.user)
  cohortAssignments!: CohortAssignment[];

  @OneToMany(() => Cohort, cohort => cohort.creator)
  createdCohorts!: Cohort[];

  @OneToMany(() => MoodHistory, history => history.user)
  moodHistory!: MoodHistory[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}