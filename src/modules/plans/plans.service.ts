import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlanDto } from 'src/modules/plans/dto/create-plan.dto';
import { UpdatePlanDto } from 'src/modules/plans/dto/update-plan.dto';
import { Repository } from 'typeorm';
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

  create(dto: CreatePlanDto) {
    return this.planRepo.save(dto);
  }

  findAll() {
    return this.planRepo.find();
  }

  findOne(id: string, slug?: string) {
    return this.planRepo.findOneOrFail({
      where: slug ? { slug } : { id },
    });
  }

  update(id: string, dto: UpdatePlanDto) {
    return this.planRepo.update(id, dto);
  }

  remove(id: string) {
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
      },
    ];

    await this.planRepo.save(plans);
    console.log('Default plans seeded.');
  }
}
