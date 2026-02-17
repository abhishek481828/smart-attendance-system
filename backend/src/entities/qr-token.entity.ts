import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Session } from './session.entity';

@Entity('qr_tokens')
export class QrToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Session, { onDelete: 'CASCADE' })
  @JoinColumn()
  session: Session;

  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
