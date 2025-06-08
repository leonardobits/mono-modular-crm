import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AdminGuard } from "./guards/admin.guard";
import { SupabaseModule } from "src/supabase/supabase.module";

@Module({
  imports: [SupabaseModule],
  controllers: [UsersController],
  providers: [UsersService, AdminGuard],
})
export class UsersModule {} 