import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber, ArrayUnique } from 'class-validator';

export class CreateGovernmentDto {
    @ApiProperty({ example: 'Federal Government', description: 'Name of the government' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ type: () => [Number], description: 'List of region IDs associated with the government', example: [1, 2, 3] })
    @IsOptional()  // Makes the field optional
    @IsArray()
    @ArrayUnique()  // Ensures all IDs are unique
    @IsNumber({}, { each: true })  // Validates each element in the array is a number
    regionIds?: number[];
}
