import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/config/constant';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
