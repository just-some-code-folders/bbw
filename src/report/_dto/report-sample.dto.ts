import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt } from 'class-validator';

export class ReportSampleDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    sampleId: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    quantity: number;
}
