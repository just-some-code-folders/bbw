import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, ValidateNested, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportSampleDto } from './report-sample.dto';
import { ReportProductDto } from './report-product.dto';
import { Government } from 'src/_government/entities/governments.entity';
import { Region } from 'src/_government/region/entities/regions.entity';
import { Person } from 'src/_person/_entities/persons.entity';

export class UpdateReportDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    duration?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    specialty?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    note?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ type: [ReportSampleDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReportSampleDto)
    reportSamples?: ReportSampleDto[];

    @ApiPropertyOptional({ type: [ReportProductDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReportProductDto)
    reportProducts?: ReportProductDto[];

    @ApiPropertyOptional({ type: () => Government })
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => Government)
    government?: Government;

    @ApiPropertyOptional({ type: () => Region })
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => Region)
    region?: Region;

    @ApiPropertyOptional({ type: () => Person })
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => Person)
    person?: Person;
}
