import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSampleDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;
}
