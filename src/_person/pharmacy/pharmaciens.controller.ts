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
  import { PharmaciensService } from './pharmaciens.service';

  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { Roles } from '../../roles/roles.decorator';
  import { RoleEnum } from '../../roles/roles.enum';
  import { AuthGuard } from '@nestjs/passport';
  import { RolesGuard } from '../../roles/roles.guard';
  import { infinityPagination } from '../../utils/infinity-pagination';
  import { Pharmacien } from './entities/pharmaciens.entity';
  import { InfinityPaginationResultType } from '../../utils/types/infinity-pagination-result.type';
  import { NullableType } from '../../utils/types/nullable.type';
  
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiTags('Pharmaciens')
  @Controller({
    path: 'pharmacies',
    version: '1',
  })
  export class PharmaciensController {
    constructor(private readonly pharmaciesService: PharmaciensService) {}
  
    
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createProfileDto: any): Promise<Pharmacien> {
      return this.pharmaciesService.create(createProfileDto);
    }
    
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(@Param('id') id: string): Promise<NullableType<Pharmacien>> {
      return this.pharmaciesService.findOne({ id: +id });
    }
  
    
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    update(
      @Param('id') id: number,
      @Body() updateProfileDto: any,
    ): Promise<Pharmacien> {
      return this.pharmaciesService.update(id, updateProfileDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: number): Promise<void> {
      return this.pharmaciesService.delete(id);
    }
  }
  