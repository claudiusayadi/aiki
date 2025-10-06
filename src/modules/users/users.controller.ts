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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { IdDto } from '../../core/common/dto/id.dto';
import { RemoveDto } from '../../core/common/dto/remove.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthDto } from '../auth/dto/auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './enums/roles.enum';
import type { IRequestUser } from './interfaces/user.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user account (Admin only)' })
  @ApiCreatedResponse({ description: 'User account created successfully' })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Get all user accounts (Admin only)' })
  @ApiOkResponse({
    description: 'List of all user accounts retrieved successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Admin access required' })
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get user account by ID (Owner/Admin only)' })
  @ApiOkResponse({ description: 'User account retrieved successfully' })
  @ApiUnauthorizedResponse({
    description: 'Authentication or admin access required',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':id')
  async findOne(@Param() { id }: IdDto, @ActiveUser() user: IRequestUser) {
    return await this.usersService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Update current user profile (Owner/Admin only)' })
  @ApiOkResponse({ description: 'User profile updated successfully' })
  @ApiUnauthorizedResponse({
    description: 'Authentication required or Admin access required',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch(':id')
  updateProfile(
    @Param() { id }: IdDto,
    @ActiveUser() user: IRequestUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, user, dto);
  }

  @ApiOperation({
    summary: 'Deactivate/Delete user account by ID (Owner/Admin only)',
  })
  @ApiOkResponse({
    description: 'User account deactivated/deleted successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication or admin access required',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Delete(':id')
  remove(
    @Param() { id }: IdDto,
    @ActiveUser() user: IRequestUser,
    @Query() { soft }: RemoveDto,
  ) {
    return this.usersService.remove(id, user, soft);
  }

  @ApiOperation({ summary: 'Recover user account by email' })
  @ApiOkResponse({ description: 'Recovery email sent if account exists' })
  @ApiConflictResponse({
    description: 'User with this email was not deactivated',
  })
  @Get('recover')
  @Public()
  recover(@Query() dto: AuthDto) {
    return this.usersService.recover(dto);
  }
}
