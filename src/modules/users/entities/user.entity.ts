import * as argon from 'argon2';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RegistryDates } from 'src/core/common/dto/registry-dates.dto';
import { Plan } from 'src/modules/plans/entities/plan.entity';
import { UserRole } from '../enums/roles.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bio?: string;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Exclude()
  @Column({ type: 'varchar', length: 6, nullable: true })
  verification_code?: string;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  verification_code_expires_at?: Date;

  @ManyToOne(() => Plan, { eager: true })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column({ type: 'int', default: 5 })
  tasks_left: number;

  @Column({ type: 'timestamp', nullable: true })
  renews_at: Date | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role',
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'timestamp', name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  @Column(() => RegistryDates, { prefix: false })
  registry: RegistryDates;

  @BeforeInsert()
  @BeforeUpdate()
  protected async hashPassword() {
    if (this.password) {
      // Only hash if it's not already hashed
      if (!this.password.startsWith('$argon2')) {
        this.password = await argon.hash(this.password);
      }
    }
  }

  async compare(password: string): Promise<boolean> {
    if (!this.password) throw new Error('User password hash is missing');
    if (!password) throw new Error('Password to compare is missing');
    return await argon.verify(this.password, password);
  }

  get isDeleted(): boolean {
    return !!this.registry.deletedAt;
  }
}
