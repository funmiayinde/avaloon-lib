import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class MobileDto {
  @ApiProperty({ example: '+2348154640557' })
  @IsPhoneNumber('ZZ')
  readonly phoneNumber: string;

  @ApiProperty({ example: 'NG' })
  @IsString()
  @IsOptional()
  @Length(2, 2)
  @Transform((s) => String(s.value).trim().toLowerCase())
  readonly isCode: string = 'NG';
}
