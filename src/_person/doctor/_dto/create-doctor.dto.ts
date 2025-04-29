import { ApiProperty } from '@nestjs/swagger';
import { Specialty } from '../specialty/entities/specialties.entity';

export class CreateDoctorDto {
    @ApiProperty({ example: 1, description: 'ID of the specialty' })
    specialty?: Specialty;
    @ApiProperty({ example: "1", description: 'ID of the type' })

    type?: string;
}
