import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AdminGuard } from "./guards/admin.guard";
import { SupabaseModule } from "src/supabase/supabase.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService, AdminGuard],
})
export class UsersModule {} 