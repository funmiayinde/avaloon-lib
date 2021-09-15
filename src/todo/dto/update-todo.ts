import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateTodoDto {
  @ApiProperty({ example: 'Task 1' })
  @Transform((s) => s.trim().toLowerCase())
  readonly title: string;

  @Transform((s) => s.trim())
  readonly description: string;
}
