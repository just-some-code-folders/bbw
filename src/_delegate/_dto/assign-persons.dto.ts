import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class AssignPersonsDto {
    @ApiProperty({ 
        example: [1, 2, 3], 
        description: 'Array of Person IDs to be assigned to the Delegate' 
    })
    @IsArray()
    @ArrayNotEmpty()  // Ensures the array is not empty
    @ArrayUnique()    // Ensures all IDs are unique
    @IsNumber({}, { each: true })  // Validates each element in the array is a number
    @IsNotEmpty({ each: true })   // Ensures each number is not empty
    person: number[];
}
