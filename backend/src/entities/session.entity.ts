import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Class } from './class.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Class)
  class: Class;

  @Column()
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column()
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
