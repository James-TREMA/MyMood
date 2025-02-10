import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("mood_scores")
export class MoodScore {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  user_id!: number;

  @Column({ nullable: false })
  score!: number;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => User, user => user.moodScores)
  @JoinColumn({ name: "user_id" })
  user!: User;
}