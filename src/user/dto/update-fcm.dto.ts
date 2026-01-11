import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateFcmDto {
  @ApiProperty()
  @IsString()
  fcm_token: string;
}
