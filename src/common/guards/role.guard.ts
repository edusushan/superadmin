import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schema/user.schema';
import { Role } from 'src/config/constant';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const userRole = request.user.role;

    if (!roles || !roles.includes(userRole)) {
      return false;
    }

    if (userRole === 'USER') {
      const isActive = await this.checkActive(request.user.id);
      return isActive;
    }

    return true;
  }

  private async checkActive(id: string): Promise<boolean> {
    const user = await this.userModel.findById(id).exec();

    // If user is not found or is disabled by admin, return false
    if (!user || user.disabled_by_admin) {
      return false;
    }

    return true;
  }
}
