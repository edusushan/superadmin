import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeederModule } from './seeder/seeder.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { AtGuard, UserCheckGuard } from './common/guards';
import { APP_GUARD } from '@nestjs/core';
import { SchemaModule } from './schema/schema.module';
import { ChatModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    SeederModule,
    AuthModule,
    SchemaModule,
    ChatModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserCheckGuard,
    },
  ],
})
export class AppModule {}
