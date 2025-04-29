import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsNumber } from 'class-validator';

export class FilterProductDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsNumber()
    price?: number;

    @ApiPropertyOptional({ type: Number })
    @IsOptional()
    @IsInt()
    reportId?: number;
}
