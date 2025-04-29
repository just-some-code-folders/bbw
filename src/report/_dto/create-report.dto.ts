import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportProductDto } from './report-product.dto';
import { ReportSampleDto } from './report-sample.dto';

export class CreateReportDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    date: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    duration: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    specialty: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    note?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    status: string;

    @ApiProperty({ type: [ReportSampleDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReportSampleDto)
    reportSamples: ReportSampleDto[];

    @ApiProperty({ type: [ReportProductDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReportProductDto)
    reportProducts: ReportProductDto[];

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    governmentId: number;
    
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    regionId: number;
    
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    personId: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    delegateId: number;
    
}
