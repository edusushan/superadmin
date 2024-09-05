import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schema/user.schema'; // Adjust the path to your User schema
import { Response } from 'express';

@Injectable()
export class UserCheckGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private readonly userModel: Model<User>, // Inject Mongoose model
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const { user } = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse() as Response;

    const exists = await this.userModel.findOne({ email: user.email }).exec();

    if (!exists) {
      response.cookie('token', '');
      throw new UnauthorizedException('Token has expired');
    }

    return true;
  }
}
