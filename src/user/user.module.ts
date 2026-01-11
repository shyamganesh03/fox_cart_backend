import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseModule } from 'src/database/database.module';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [DatabaseModule, SupabaseModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
