import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  UsePipes,
  Put,
  Patch,
  Param,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { ZodValidationPipe } from "nestjs-zod";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AdminGuard } from "./guards/admin.guard";

@Controller("api/v1/users")
@UseGuards(AdminGuard)
@UsePipes(ZodValidationPipe)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query('status') status?: 'active' | 'inactive') {
    return await this.usersService.findAll(status);
  }

  @Post()
  async create(
    @Body()
    createUserDto: CreateUserDto
  ) {
    return await this.usersService.create(createUserDto);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Patch(":id/deactivate")
  async deactivate(@Param("id") id: string) {
    return await this.usersService.deactivate(id);
  }

  @Patch(":id/reactivate")
  async reactivate(@Param("id") id: string) {
    return await this.usersService.reactivate(id);
  }
} 