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
  ApiConflictResponse,
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
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthDto } from '../auth/dto/auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from './enums/roles.enum';
import type { IRequestUser } from './interfaces/user.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user account - admin only' })
  @ApiCreatedResponse({
    description: 'User account created successfully',
    type: User,
  })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return await this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Get all user accounts - admin only' })
  @ApiOkResponse({
    description: 'List of all user accounts retrieved successfully',
    type: [User],
  })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: QueryDto) {
    return this.usersService.findAll(query);
  }

  @ApiOperation({ summary: 'Get user account by ID - owner/admin' })
  @ApiOkResponse({
    description: 'User account retrieved successfully',
    type: User,
  })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':id')
  async findOne(@Param() { id }: IdDto, @ActiveUser() user: IRequestUser) {
    return await this.usersService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Update user profile - owner/admin' })
  @ApiOkResponse({
    description: 'User profile updated successfully',
    type: User,
  })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch(':id')
  updateProfile(
    @Param() { id }: IdDto,
    @ActiveUser() user: IRequestUser,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, user, dto);
  }

  @ApiOperation({
    summary: 'Deactivate/Delete user account by ID - owner/admin',
  })
  @ApiNoContentResponse({
    description: 'User account deactivated/deleted successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Delete(':id')
  remove(
    @Param() { id }: IdDto,
    @ActiveUser() user: IRequestUser,
    @Query() { soft }: RemoveDto,
  ): Promise<User> {
    return this.usersService.remove(id, user, soft);
  }

  @ApiOperation({ summary: 'Recover user account by email' })
  @ApiOkResponse({ description: 'Account recovered if exists' })
  @ApiConflictResponse({
    description: 'User with this email was not deleted',
  })
  @Get('recover')
  @Public()
  recover(@Query() dto: AuthDto): Promise<User> {
    return this.usersService.recover(dto);
  }
}
