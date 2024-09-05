import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/user.schema'; // Adjust the path

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  exports: [MongooseModule], // Export MongooseModule to make UserModel available
})
export class SchemaModule {}
