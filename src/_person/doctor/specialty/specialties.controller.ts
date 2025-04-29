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
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../roles/roles.decorator';
import { RoleEnum } from '../../../roles/roles.enum';
import { RolesGuard } from '../../../roles/roles.guard';
import { SpecialtysService } from './specialties.service';
import { CreateSpecialtyDto } from './_dto/create-specialty.dto';
import { Specialty } from './entities/specialties.entity';
import { InfinityPaginationResultType } from '../../../utils/types/infinity-pagination-result.type';
import { infinityPagination } from '../../../utils/infinity-pagination';
import { NullableType } from '../../../utils/types/nullable.type';
import { UpdateSpecialtyDto } from './_dto/update-specialty.dto';
  
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiTags('Specialtys')
  @Controller({
    path: 'specialtys',
    version: '1',
  })
  export class SpecialtysController {
    constructor(private readonly specialtysService: SpecialtysService) {}
  
    
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createProfileDto: CreateSpecialtyDto): Promise<Specialty> {
      return this.specialtysService.create(createProfileDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('search') search?: string, // Add search query parameter
    ): Promise<InfinityPaginationResultType<Specialty>> {
      if (limit > 50) {
        limit = 50;
      }
    
      const [data, totalCount] = await this.specialtysService.findManyWithPagination({
        page,
        limit,
        search, // Pass the search parameter
      });
    
      return infinityPagination(data, { page, limit }, totalCount);
    }
    
  
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(@Param('id') id: string): Promise<NullableType<Specialty>> {
      return this.specialtysService.findOne({ id: +id });
    }
  
    
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    update(
      @Param('id') id: number,
      @Body() updateProfileDto: UpdateSpecialtyDto,
    ): Promise<Specialty> {
      return this.specialtysService.update(id, updateProfileDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: number): Promise<void> {
      return this.specialtysService.delete(id);
    }
  }
  