import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Conversation } from '../../conversations/entities/conversation.entity';

export enum InboxType {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  TELEGRAM = 'telegram',
}

@Entity('inboxes')
export class Inbox {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: InboxType,
    default: InboxType.WHATSAPP
  })
  type: InboxType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @ManyToOne(() => Tenant, tenant => tenant.inboxes)
  tenant: Tenant;

  @OneToMany(() => Conversation, conversation => conversation.inbox)
  conversations: Conversation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 