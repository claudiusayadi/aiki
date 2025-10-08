import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { compareIds } from '../../core/common/utils/compare-ids.util';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/roles.enum';
import { IRequestUser } from '../users/interfaces/user.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasksRepo: Repository<Task>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  public async create(currentUser: IRequestUser, dto: CreateTaskDto) {
    const user = await this.usersRepo.findOneOrFail({
      where: { id: currentUser.id },
    });

    // Check if user has tasks left (null = unlimited)
    if (user.tasks_left !== null && user.tasks_left <= 0) {
      throw new BadRequestException(
        'No tasks left. Please upgrade your plan to create more tasks.',
      );
    }

    // Decrement tasks_left only if not unlimited
    if (user.tasks_left !== null) {
      user.tasks_left -= 1;
      await this.usersRepo.save(user);
    }

    const task = this.tasksRepo.create({
      ...dto,
      user,
    });

    return await this.tasksRepo.save(task);
  }

  public async findAll(currentUser: IRequestUser) {
    // Admins can see all tasks, users see only their own
    const where =
      currentUser.role === UserRole.ADMIN
        ? {}
        : { user: { id: currentUser.id } };

    return await this.tasksRepo.find({
      where,
      relations: { user: true },
      order: { registry: { createdAt: 'DESC' } },
    });
  }

  public async findOne(id: string, currentUser: IRequestUser) {
    if (currentUser.role !== UserRole.ADMIN) compareIds(currentUser.id, id);

    return await this.tasksRepo.findOneOrFail({
      where: { id },
      relations: { user: true },
    });
  }

  public async update(
    id: string,
    currentUser: IRequestUser,
    dto: UpdateTaskDto,
  ) {
    if (currentUser.role !== UserRole.ADMIN) compareIds(currentUser.id, id);

    const task = await this.tasksRepo.preload({
      id,
      ...dto,
    });

    if (!task) throw new NotFoundException('Task not found');
    return await this.tasksRepo.save(task);
  }

  public async remove(
    id: string,
    currentUser: IRequestUser,
    soft: boolean = false,
  ) {
    const task = await this.findOne(id, currentUser);

    if (currentUser.role !== UserRole.ADMIN) {
      compareIds(currentUser.id, id);
    }

    if (!soft) throw new ForbiddenException('Forbidden resource');

    return soft
      ? await this.tasksRepo.softRemove(task)
      : await this.tasksRepo.remove(task);
  }

  public async restore(id: string, currentUser: IRequestUser) {
    if (currentUser.role !== UserRole.ADMIN) compareIds(currentUser.id, id);

    const task = await this.tasksRepo.findOne({
      where: { id, user: { id: currentUser.id } },
      withDeleted: true,
    });

    if (!task) throw new NotFoundException('Task not found');
    if (!task.isDeleted) throw new ConflictException('Task not deleted');
    return await this.tasksRepo.recover(task);
  }
}
