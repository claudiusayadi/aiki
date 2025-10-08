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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { IdDto } from '../../core/common/dto/id.dto';
import { QueryDto } from '../../core/common/dto/query.dto';
import { RemoveDto } from '../../core/common/dto/remove.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { IRequestUser } from '../users/interfaces/user.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Create a new task' })
  @ApiCreatedResponse({
    description: 'Task created successfully',
    type: Task,
  })
  @Post()
  async create(@ActiveUser() user: IRequestUser, @Body() dto: CreateTaskDto) {
    return await this.tasksService.create(user, dto);
  }

  @ApiOperation({ summary: 'Get all tasks - owner/admin' })
  @ApiOkResponse({
    description: 'List of tasks retrieved successfully',
    type: [Task],
  })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @Get()
  async findAll(@ActiveUser() user: IRequestUser, @Query() query: QueryDto) {
    return await this.tasksService.findAll(user, query);
  }

  @ApiOperation({ summary: 'Get task by ID - owner/admin' })
  @ApiOkResponse({
    description: 'Task retrieved successfully',
    type: Task,
  })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @Get(':id')
  async findOne(@Param() { id }: IdDto, @ActiveUser() user: IRequestUser) {
    return await this.tasksService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Update task by ID - owner/admin' })
  @ApiOkResponse({
    description: 'Task updated successfully',
    type: Task,
  })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @Patch(':id')
  async update(
    @Param() { id }: IdDto,
    @ActiveUser() user: IRequestUser,
    @Body() dto: UpdateTaskDto,
  ) {
    return await this.tasksService.update(id, user, dto);
  }

  @ApiOperation({ summary: 'Soft/hard delete task by ID - owner/admin' })
  @ApiNoContentResponse({
    description: 'Task deleted successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @Delete(':id')
  async remove(
    @Param() { id }: IdDto,
    @ActiveUser() user: IRequestUser,
    @Query() { soft }: RemoveDto,
  ) {
    return await this.tasksService.remove(id, user, soft);
  }

  @ApiOperation({
    summary: 'Restore user task by ID',
  })
  @ApiNoContentResponse({
    description: 'Task restored successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @Get(':id/restore')
  async restore(@Param() { id }: IdDto, @ActiveUser() user: IRequestUser) {
    return await this.tasksService.restore(id, user);
  }
}
