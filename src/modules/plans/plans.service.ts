import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { QueryDto } from '../../core/common/dto/query.dto';
import { PaginatedResult } from '../../core/common/interfaces/paginated-result.interface';
import { PaginationUtil } from '../../core/common/utils/pagination.util';
import { ApiConfig } from '../../core/config/app.config';
import { CreatePlanDto } from '../plans/dto/create-plan.dto';
import { UpdatePlanDto } from '../plans/dto/update-plan.dto';
import { Plan } from './entities/plan.entity';

@Injectable()
export class PlansService implements OnModuleInit {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  public async create(dto: CreatePlanDto): Promise<Plan> {
    return this.planRepo.save(dto);
  }

  public async findAll(query: QueryDto): Promise<PaginatedResult<Plan>> {
    return await PaginationUtil.paginate(this.planRepo, {
      pagination: query,
      sort: query,
    });
  }

  public async findOne(id: string, slug?: string): Promise<Plan> {
    return this.planRepo.findOneOrFail({
      where: slug ? { slug } : { id },
    });
  }

  public async update(id: string, dto: UpdatePlanDto): Promise<UpdateResult> {
    return this.planRepo.update(id, dto);
  }

  public async remove(id: string): Promise<DeleteResult> {
    const plan = await this.findOne(id);
    return this.planRepo.delete({ id: plan.id });
  }

  public async onModuleInit() {
    await this.seedDefaultPlans();
  }

  private async seedDefaultPlans(): Promise<void> {
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
    this.logger.log('Default plans seeded.');
  }
}
