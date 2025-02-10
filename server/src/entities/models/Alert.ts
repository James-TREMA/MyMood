import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("alerts")
export class Alert {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  user_id!: number;

  @Column({ nullable: false })
  supervisor_id!: number;

  @Column({
    type: "enum",
    enum: ["pending", "resolved"],
    default: "pending",
    name: "status"
  })
  status!: "pending" | "resolved";

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: "timestamp", nullable: true })
  resolved_at?: Date;

  @ManyToOne(() => User, user => user.alerts)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => User, user => user.supervisedAlerts)
  @JoinColumn({ name: "supervisor_id" })
  supervisor!: User;
}