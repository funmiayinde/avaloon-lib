import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class EmailDto {
  @ApiProperty({ example: 'example@test.com' })
  @IsNotEmpty()
  @Transform((s) => String(s.value).trim().toLowerCase())
  readonly email: string;
}
