import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  create(@Body() dto: CreatePlanDto): Promise<Plan> {
    return this.plansService.create(dto);
  }

  @ApiOperation({ summary: 'Get all plans' })
  @ApiOkResponse({ type: [Plan] })
  @Public()
  @Get()
  findAll(): Promise<Plan[]> {
    return this.plansService.findAll();
  }

  @ApiOperation({ summary: 'Get a plan by ID' })
  @ApiOkResponse({ type: Plan })
  @Public()
  @Get(':id')
  findOne(@Param() { id }: IdDto): Promise<Plan> {
    return this.plansService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a plan' })
  @ApiOkResponse({ type: Plan })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
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
  remove(@Param() { id }: IdDto): Promise<DeleteResult> {
    return this.plansService.remove(id);
  }
}
