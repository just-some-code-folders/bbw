import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class ReportProductDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    productId: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    potential: string;
}
