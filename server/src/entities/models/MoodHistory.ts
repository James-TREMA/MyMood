import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("mood_history")
export class MoodHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  user_id!: number;

  @Column({ nullable: false })
  previous_score!: number;

  @Column({ nullable: false })
  new_score!: number;

  @CreateDateColumn({ name: "changed_at" })
  changed_at!: Date;

  @ManyToOne(() => User, user => user.moodHistory)
  @JoinColumn({ name: "user_id" })
  user!: User;
}