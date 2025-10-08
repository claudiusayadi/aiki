import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { ApiConfig } from '../../core/config/app.config';
import { CreatePlanDto } from '../plans/dto/create-plan.dto';
import { UpdatePlanDto } from '../plans/dto/update-plan.dto';
import { Plan } from './entities/plan.entity';

@Injectable()
export class PlansService implements OnModuleInit {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultPlans();
  }

  create(dto: CreatePlanDto): Promise<Plan> {
    return this.planRepo.save(dto);
  }

  findAll(): Promise<Plan[]> {
    return this.planRepo.find();
  }

  findOne(id: string, slug?: string): Promise<Plan> {
    return this.planRepo.findOneOrFail({
      where: slug ? { slug } : { id },
    });
  }

  update(id: string, dto: UpdatePlanDto): Promise<UpdateResult> {
    return this.planRepo.update(id, dto);
  }

  remove(id: string): Promise<DeleteResult> {
    return this.planRepo.delete(id);
  }

  private async seedDefaultPlans() {
    const count = await this.planRepo.count();
    if (count > 0) return;

    const plans = [
      {
        slug: 'starter',
        name: 'Starter',
        description: 'Free forever. Create up to 5 tasks to get started.',
        task_limit: 5,
        price: 0,
        is_subscription: false,
      },
      {
        slug: 'focus',
        name: 'Focus',
        description:
          'Pay-as-you-go plan. Purchase task slots as you need them.',
        task_limit: null,
        price: 1000,
        is_subscription: false,
      },
      {
        slug: 'flow',
        name: 'Flow',
        description:
          'Unlimited tasks with a monthly subscription. Renewed automatically.',
        task_limit: null,
        price: 10000,
        is_subscription: true,
        metadata: {
          paystack_plan_code: ApiConfig.FLOW_PLAN_CODE,
        },
      },
    ];

    await this.planRepo.save(plans);
    console.log('Default plans seeded.');
  }
}
