import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schema/user.schema';

@Injectable()
export class SeederService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>,) {}

  async seedAdminUser() {
    try {
      const adminUser = new this.userModel({
        name: 'Super Admin',
        email: 'superadmin@gmail.com',
        password: 'password',
        role: 'ADMIN',
      });
      await adminUser.save();
      console.log('Super admin seeded successfully');
    } catch (error) {
      console.log('Error while seeding super admin', error);
    }
  }
}
