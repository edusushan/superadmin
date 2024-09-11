import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum ChatRoomTypeEnum {
  DIRECT = 'DIRECT',
}

export class CreateChatRoomDto {
  @IsEnum(ChatRoomTypeEnum)
  @Transform(({ value }) => value.toString())
  @IsNotEmpty()
  type: ChatRoomTypeEnum;

  @IsString()
  @IsOptional()
  name: string;

  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, {
    each: true,
    message: 'Each participant must be a valid UUID',
  })
  @IsNotEmpty()
  participants: string[];
}
