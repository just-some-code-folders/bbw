import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { Government } from '../../../_government/entities/governments.entity';

export class CreateRegionDto {
    @ApiProperty({ example: 'North Region', description: 'Name of the region' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ type: () => Number, description: 'ID of the government associated with the region', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    government: Government;
}
