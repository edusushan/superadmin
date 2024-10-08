import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from 'src/config/constant';

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);

export interface TokenUser {
  id: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}
