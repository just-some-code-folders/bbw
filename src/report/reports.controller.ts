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
import { ReportsService } from './reports.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { infinityPagination } from '../utils/infinity-pagination';
import { Report } from './entities/reports.entity';
import { InfinityPaginationResultType } from '../utils/types/infinity-pagination-result.type';
import { NullableType } from '../utils/types/nullable.type';
import { CreateReportDto } from './_dto/create-report.dto';
import { FilterReportDto } from './_dto/filter-report.dto';
import { UpdateReportDto } from './_dto/update-report.dto';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Reports')
@Controller({
  path: 'reports',
  version: '1',
})
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }


  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateReportDto): Promise<Report> {
    return this.reportsService.create(createProfileDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string, // Optional search parameter
    @Query() query?: any, // Capture all query parameters
  ): Promise<InfinityPaginationResultType<Report>> {
    if (limit > 50) {
      limit = 50; // Enforce maximum limit
    }

    // Extract filters from query, ignoring pagination and search keys
    const { page: ignorePage, limit: ignoreLimit, search: ignoreSearch, ...filters } = query;

    // Parse the filters to handle multiple values
    const parsedFilters = this.parseFilters(filters);

    // Call the service with the parsed filters
    const [data, totalCount] = await this.reportsService.findManyWithPagination(
      { page, limit },
      parsedFilters,
      search,
    );

    return infinityPagination(data, { page, limit }, totalCount);
  }
  
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<NullableType<Report>> {
    return this.reportsService.findOne({ id: +id });
  }


  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: number,
    @Body() updateProfileDto: UpdateReportDto,
  ): Promise<Report> {
    return this.reportsService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number): Promise<void> {
    return this.reportsService.delete(id);
  }

  @Post('filter')
  @HttpCode(HttpStatus.OK)
  filter(
    @Body() filterReportDto: FilterReportDto,
  ): Promise<Report[]> {
    return this.reportsService.filter(filterReportDto);
  }

  parseFilters(filters: { [key: string]: any }): { [key: string]: any } {
    return Object.keys(filters).reduce((acc, key) => {
      const value = filters[key];

      // If value is a comma-separated list, convert it into an array of values
      if (typeof value === 'string' && value.includes(',')) {
        acc[key] = value.split(',').map((item) => item.trim());
      }
      // If the value is a single value, just add it as is
      else if (value) {
        acc[key] = value;
      }

      return acc;
    }, {} as { [key: string]: any });
  }
}

