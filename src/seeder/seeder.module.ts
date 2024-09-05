import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
