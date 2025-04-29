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

  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { Roles } from '../../roles/roles.decorator';
  import { RoleEnum } from '../../roles/roles.enum';
  import { AuthGuard } from '@nestjs/passport';
  import { RolesGuard } from '../../roles/roles.guard';
  import { infinityPagination } from '../../utils/infinity-pagination';
  import { InfinityPaginationResultType } from '../../utils/types/infinity-pagination-result.type';
  import { NullableType } from '../../utils/types/nullable.type';
import { WholesalersService } from './wholesalers.service';
import { Wholesaler } from './entities/wholesalers.entity';
  
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiTags('Wholesalers')
  @Controller({
    path: 'wholesalers',
    version: '1',
  })
  export class WholesalersController {
    constructor(private readonly wholesalersService: WholesalersService) {}
  
    
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createProfileDto: any): Promise<Wholesaler> {
      return this.wholesalersService.create(createProfileDto);
    }
  
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(@Param('id') id: string): Promise<NullableType<Wholesaler>> {
      return this.wholesalersService.findOne({ id: +id });
    }
  
    
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    update(
      @Param('id') id: number,
      @Body() updateProfileDto: any,
    ): Promise<Wholesaler> {
      return this.wholesalersService.update(id, updateProfileDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: number): Promise<void> {
      return this.wholesalersService.delete(id);
    }
  }
  