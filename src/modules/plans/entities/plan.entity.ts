import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { RegistryDates } from 'src/core/common/dto/registry-dates.dto';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  task_limit?: number | null; // null = unlimited

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'boolean', default: false })
  is_subscription: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column(() => RegistryDates, { prefix: false })
  public registry: RegistryDates;
}
