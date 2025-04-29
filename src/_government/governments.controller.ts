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
  import { GovernmentsService } from './governments.service';

  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { Roles } from '../roles/roles.decorator';
  import { RoleEnum } from '../roles/roles.enum';
  import { AuthGuard } from '@nestjs/passport';
  import { RolesGuard } from '../roles/roles.guard';
  import { infinityPagination } from '../utils/infinity-pagination';
  import { Government } from './entities/governments.entity';
  import { InfinityPaginationResultType } from '../utils/types/infinity-pagination-result.type';
  import { NullableType } from '../utils/types/nullable.type';
import { CreateGovernmentDto } from './_dto/create-government.dto';
import { UpdateGovernmentDto } from './_dto/update-government.dto';
import { FilterGovernmentDto } from './_dto/filter-government.dto';
  
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiTags('Governments')
  @Controller({
    path: 'governments',
    version: '1',
  })
  export class GovernmentsController {
    constructor(private readonly governmentsService: GovernmentsService) {}
  
    
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createProfileDto: CreateGovernmentDto): Promise<Government> {
      return this.governmentsService.create(createProfileDto);
    }
  
    
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ): Promise<InfinityPaginationResultType<Government>> {
        if (limit > 50) {
            limit = 50;
        }

        const [data, totalCount] = await this.governmentsService.findManyWithPagination({
            page,
            limit,
        });

        return infinityPagination(data, { page, limit }, totalCount);
    }
  
    
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(@Param('id') id: string): Promise<NullableType<Government>> {
      return this.governmentsService.findOne({ id: +id });
    }
  
    
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    update(
      @Param('id') id: number,
      @Body() updateProfileDto: UpdateGovernmentDto,
    ): Promise<Government> {
      return this.governmentsService.update(id, updateProfileDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: number): Promise<void> {
      return this.governmentsService.delete(id);
    }

    @Post('filter')
    @HttpCode(HttpStatus.OK)
    filter(
      @Body() filterGovernmentDto: FilterGovernmentDto,
    ): Promise<Government[]> {
      return this.governmentsService.filter(filterGovernmentDto);
    }
  }
  