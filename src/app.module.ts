import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { LoggingMiddleware, SupabaseAuthMiddleware } from './middlewares';
import { UserModule } from './user/user.module';
import { DatabaseController } from './database/database.controller';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    SupabaseModule,
    UserModule,
    DatabaseModule,
  ],
  controllers: [AppController, DatabaseController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
    consumer.apply(SupabaseAuthMiddleware).exclude('auth/(.*)').forRoutes('*');
  }
}
