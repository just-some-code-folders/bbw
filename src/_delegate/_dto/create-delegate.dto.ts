import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDelegateDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastname: string;

  @ApiProperty({ example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '123 Main St, Anytown, USA' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: 'secret123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
