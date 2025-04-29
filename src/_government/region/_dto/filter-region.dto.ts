import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Government } from '../../../_government/entities/governments.entity';

export class FilterRegionDto {
    @ApiProperty({ example: 'North Region', description: 'Name of the region' })
    @IsString()
    @IsOptional()
    name: string;

    @ApiProperty({ type: () => Government, description: 'ID of the government associated with the region', example: { government: { id: 1 } } })
    @IsOptional()
    government: Government;
}
