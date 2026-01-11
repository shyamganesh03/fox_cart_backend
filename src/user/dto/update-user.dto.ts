import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateUserAddressDto } from './update-user-address.dto';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Shyam Ganesh' })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ example: '9999999999' })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiPropertyOptional({ example: 'FoxCart' })
  @IsOptional()
  @IsString()
  business_name?: string;

  @ApiPropertyOptional({ example: 'Food delivery vendor' })
  @IsOptional()
  @IsString()
  vendor_description?: string;

  @ApiPropertyOptional({ example: 'https://foxcart.in' })
  @IsOptional()
  @IsUrl()
  vendor_website?: string;

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  shop_open_time?: string;

  @ApiPropertyOptional({ example: '22:00' })
  @IsOptional()
  @IsString()
  shop_close_time?: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  avg_preparation_time?: number;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  min_order_value?: number;

  @ApiPropertyOptional({
    example: 'Male',
    description: 'Gender of the user',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    type: UpdateUserAddressDto,
    description: 'User address (insert or update)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserAddressDto)
  address?: UpdateUserAddressDto;
}
