import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSampleDto {
    @ApiProperty()
    @IsString()
    name: string;
}
