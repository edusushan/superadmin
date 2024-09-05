import { IsNotEmpty, IsNumber, Validate } from 'class-validator';
import { MatchRole } from 'src/common/validators/Role.Validator';
import { Role } from 'src/config/constant';

export class ChangeRoleDTO {
  @Validate(MatchRole)
  @IsNotEmpty()
  role: Role;
  @IsNumber()
  userId: number;
}
