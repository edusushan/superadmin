import {
  IsNotEmpty,
  IsString,
  IsEmail
} from 'class-validator';
export class AuthDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
