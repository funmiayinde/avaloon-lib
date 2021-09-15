import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ example: 'Task 1' })
  @IsString()
  @Transform((s) => s.trim().toLowerCase())
  readonly title: string;

  @ApiProperty({ example: 'Simpl description for the task' })
  @IsString()
  @Transform((s) => s.trim())
  readonly description: string;
}
