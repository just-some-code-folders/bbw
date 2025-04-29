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
    SerializeOptions,
  } from '@nestjs/common';
  import { DoctorsService } from './doctors.service';

  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { Roles } from '../../roles/roles.decorator';
  import { RoleEnum } from '../../roles/roles.enum';
  import { AuthGuard } from '@nestjs/passport';
  import { RolesGuard } from '../../roles/roles.guard';
  import { infinityPagination } from '../../utils/infinity-pagination';
  import { Doctor } from './_entities/doctors.entity';
  import { InfinityPaginationResultType } from '../../utils/types/infinity-pagination-result.type';
  import { NullableType } from '../../utils/types/nullable.type';
  
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiTags('Doctors')
  @Controller({
    path: 'doctors',
    version: '1',
  })
  export class DoctorsController {
    constructor(private readonly doctorsService: DoctorsService) {}
  
    
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createProfileDto: any): Promise<Doctor> {
      return this.doctorsService.create(createProfileDto);
    }
    
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(@Param('id') id: string): Promise<NullableType<Doctor>> {
      return this.doctorsService.findOne({ id: +id });
    }
  
    
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    update(
      @Param('id') id: number,
      @Body() updateProfileDto: any,
    ): Promise<Doctor> {
      return this.doctorsService.update(id, updateProfileDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: number): Promise<void> {
      return this.doctorsService.delete(id);
    }
  }
  