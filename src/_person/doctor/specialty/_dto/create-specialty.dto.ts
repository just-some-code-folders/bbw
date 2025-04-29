import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSpecialtyDto {
    @ApiProperty({ example: 'Cardiology', description: 'Name of the specialty' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'CARD', description: 'Abbreviation for the specialty' })
    @IsString()
    @IsNotEmpty()
    abreviation: string;
}
