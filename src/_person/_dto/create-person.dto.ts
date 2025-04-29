import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { Doctor } from '../doctor/_entities/doctors.entity';
import { Pharmacien } from '../pharmacy/entities/pharmaciens.entity';
import { Wholesaler } from '../wholesaler/entities/wholesalers.entity';
import { Government } from '../../_government/entities/governments.entity';
import { Region } from '../../_government/region/entities/regions.entity';

export class CreatePersonDto {
    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstname: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastname: string;

    @ApiProperty({ example: 'A+' })
    @IsString()
    @IsOptional()
    potential: string;

    @ApiProperty({ example: '1234' })
    @IsString()
    @IsOptional()
    code: string;

    @ApiProperty({ example: '123 Main St, City, Country' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ example: '+1234567890' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({ example: 'mail@mail.com' })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ type: () => Doctor, nullable: true })
    @IsOptional()
    @IsObject()
    doctor?: Doctor;

    @ApiProperty({ type: () => Pharmacien, nullable: true })
    @IsOptional()
    @IsObject()
    pharmacien?: Pharmacien;

    @ApiProperty({ type: () => Wholesaler, nullable: true })
    @IsOptional()
    @IsObject()
    wholesaler?: Wholesaler;

    @ApiProperty({ type: () => Government })
    @IsNotEmpty()
    @IsObject()
    government: Government;

    @ApiProperty({ type: () => Region })
    @IsNotEmpty()
    @IsObject()
    region: Region;
}
