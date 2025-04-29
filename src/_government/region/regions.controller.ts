// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { RegionsService } from './regions.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../roles/roles.decorator';
import { RoleEnum } from '../../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../roles/roles.guard';
import { infinityPagination } from '../../utils/infinity-pagination';
import { Region } from './entities/regions.entity';
import { InfinityPaginationResultType } from '../../utils/types/infinity-pagination-result.type';
import { NullableType } from '../../utils/types/nullable.type';
import { CreateRegionDto } from './_dto/create-region.dto';
import { UpdateRegionDto } from './_dto/update-region.dto';
import { FilterRegionDto } from './_dto/filter-region.dto';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Regions')
@Controller({
  path: 'regions',
  version: '1',
})
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) { }


  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateRegionDto): Promise<Region> {
    return this.regionsService.create(createProfileDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string, // Search query parameter
    @Query('government') governmentIds?: string, // Comma-separated government IDs
  ): Promise<InfinityPaginationResultType<Region>> {
    if (limit > 50) {
      limit = 50;
    }
  
    const governmentIdArray = governmentIds
      ? governmentIds.split(',').map((id) => parseInt(id.trim(), 10))
      : undefined; // Convert the comma-separated IDs into an array of numbers
  
    const [data, totalCount] = await this.regionsService.findManyWithPagination({
      page,
      limit,
      search, // Pass the search parameter
      governmentIds: governmentIdArray, // Pass the array of government IDs or undefined
    });
  
    return infinityPagination(data, { page, limit }, totalCount);
  }
  
  
  
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<NullableType<Region>> {
    return this.regionsService.findOne({ id: +id });
  }


  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: number,
    @Body() updateProfileDto: UpdateRegionDto,
  ): Promise<Region> {
    return this.regionsService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number): Promise<void> {
    return this.regionsService.delete(id);
  }

  @Post('filter')
  @HttpCode(HttpStatus.OK)
  filter(
    @Body() filterRegionDto: FilterRegionDto,
  ): Promise<Region[]> {
    return this.regionsService.filter(filterRegionDto);
  }
}
