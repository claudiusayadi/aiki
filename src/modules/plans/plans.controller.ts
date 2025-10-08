import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DeleteResult, UpdateResult } from 'typeorm';

import { IdDto } from '../../core/common/dto/id.dto';
import { QueryDto } from '../../core/common/dto/query.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/roles.enum';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @ApiOperation({ summary: 'Create a new plan' })
  @ApiCreatedResponse({ type: Plan })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @Roles(UserRole.ADMIN)
  @Post()
  public create(@Body() dto: CreatePlanDto): Promise<Plan> {
    return this.plansService.create(dto);
  }

  @ApiOperation({ summary: 'Get all plans' })
  @ApiOkResponse({ type: [Plan] })
  @Public()
  @Get()
  public findAll(@Query() query: QueryDto) {
    return this.plansService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a plan by ID' })
  @ApiOkResponse({ type: Plan })
  @Public()
  @Get(':id')
  public findOne(@Param() { id }: IdDto): Promise<Plan> {
    return this.plansService.findOne(id);
  }

  @ApiOperation({ summary: 'Get a plan by slug' })
  @ApiOkResponse({ type: Plan })
  @Public()
  @Get(':slug')
  public findBySlug(@Param('slug') slug: string): Promise<Plan> {
    return this.plansService.findOne(slug);
  }

  @ApiOperation({ summary: 'Update a plan' })
  @ApiOkResponse({ type: Plan })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  public update(
    @Param() { id }: IdDto,
    @Body() dto: UpdatePlanDto,
  ): Promise<UpdateResult> {
    return this.plansService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a plan' })
  @ApiNoContentResponse({ description: 'Plan deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  public remove(@Param() { id }: IdDto): Promise<DeleteResult> {
    return this.plansService.remove(id);
  }
}
