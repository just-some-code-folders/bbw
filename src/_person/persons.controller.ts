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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { PersonsService } from './persons.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { infinityPagination } from '../utils/infinity-pagination';
import { Person } from './_entities/persons.entity';
import { InfinityPaginationResultType } from '../utils/types/infinity-pagination-result.type';
import { NullableType } from '../utils/types/nullable.type';
import { CreatePersonDto } from './_dto/create-person.dto';
import { UpdatePersonDto } from './_dto/update-person.dto';
import { FilterPersonDto } from './_dto/filter-person.dto';
import { FileInterceptor } from '@nestjs/platform-express';


@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Persons')
@Controller({
  path: 'persons',
  version: '1',
})
export class PersonsController {
  constructor(private readonly personsService: PersonsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPersonDto: CreatePersonDto): Promise<Person> {
    return this.personsService.create(createPersonDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() queryParams: any,  // Capture all query parameters dynamically
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<InfinityPaginationResultType<Person>> {
    if (limit > 50) {
      limit = 50;
    }

    // Pass the dynamic filters (queryParams) to the service
    const [data, totalCount] = await this.personsService.findManyWithPagination({
      page,
      limit,
      filters: queryParams,  // Pass queryParams to service as filters
    });

    return infinityPagination(data, { page, limit }, totalCount);
  }



  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<NullableType<Person>> {
    return this.personsService.findOne({ id: +id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: number,
    @Body() updatePersonDto: UpdatePersonDto,
  ): Promise<Person> {
    return this.personsService.update(id, updatePersonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number): Promise<void> {
    return this.personsService.delete(id);
  }

  @Post('filter')
  @HttpCode(HttpStatus.OK)
  filter(
    @Body() filterPersonDto: FilterPersonDto,
  ): Promise<Person[]> {
    return this.personsService.filter(filterPersonDto);
  }

  @Get('type/:typeId')
  @HttpCode(HttpStatus.OK)
  async getByType(
    @Param('typeId', ParseIntPipe) typeId: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('search') search?: string,
    @Query() query?: any,
  ): Promise<{ data: Person[]; total: number }> {
    const { page: ignorePage, limit: ignoreLimit, search: ignoreSearch, ...filters } = query;
    const parsedFilters = this.parseFilters(filters); // Use the utility function
    return this.personsService.getByType(typeId, page, limit, parsedFilters, search);
  }
  

  @Get('delegate/:delegateId')
  @HttpCode(HttpStatus.OK)
  async getByDelegate(
    @Param('delegateId', ParseIntPipe) delegateId: number,
    @Query('typeIds') typeIds?: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('search') search?: string,
    @Query() query?: any,
  ): Promise<{ data: Person[]; total: number }> {
    const { page: ignorePage, limit: ignoreLimit, search: ignoreSearch, typeIds: ignoreTypeIds, ...filters } = query;
    const typeIdsArray = typeIds 
      ? typeIds.split(',').map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)) 
      : [];
    const parsedFilters = this.parseFilters(filters); // Use the utility function
    return this.personsService.getByDelegate(delegateId, typeIdsArray, { page, limit }, parsedFilters, search);
  }
  
  @Get('not-delegate/:delegateId/:typeId')
  @HttpCode(HttpStatus.OK)
  async getNonAssigned(
    @Param('delegateId', ParseIntPipe) delegateId: number,
    @Param('typeId', ParseIntPipe) typeId: number = 1,
    @Query('page', ParseIntPipe) page: number = 1, // Default page is 1
    @Query('limit', ParseIntPipe) limit: number = 10, // Default limit is 10
    @Query('search') search?: string, // Optional parameter for search
    @Query() query?: any, // Capture all other query params (filters)
  ): Promise<{ data: Person[]; total: number }> {
    const { page: ignorePage, limit: ignoreLimit, search: ignoreSearch, ...filters } = query; // Extract filters
    const parsedFilters = this.parseFilters(filters); // Use the utility function for filter parsing
    return this.personsService.getNonAssigned(delegateId, typeId, { page, limit }, parsedFilters, search);
  }
  
  @Post('import/doctors')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async importPersons(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'text/csv|application/json' })],
      }),
    )
    file: Express.Multer.File,
    @Query('format', new DefaultValuePipe('csv')) format: 'csv' | 'json',
  ): Promise<any> {
    return this.personsService.importPersons(file.buffer, format, "doctor");
  }

  @Post('import/others')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async importOthers(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'text/csv|application/json' })],
      }),
    )
    file: Express.Multer.File,
    @Query('format', new DefaultValuePipe('csv')) format: 'csv' | 'json',
  ): Promise<any> {
    return this.personsService.importPersons(file.buffer, format, "mixed");
  } t

  @Get('export/type/:typeId')
  @HttpCode(HttpStatus.OK)
  async exportByType(
    @Param('typeId', ParseIntPipe) typeId: number,
    @Query('format', new DefaultValuePipe('csv')) format: string
  ): Promise<Buffer> {
    const data = await this.personsService.getByTypeForExport(typeId);
    return this.personsService.exportData(data, format);
  }

  @Delete(':personId/delegates')
  @HttpCode(HttpStatus.NO_CONTENT)
  async disassociate(
    @Param('personId', ParseIntPipe) personId: number,
    @Query('delegateIds') delegateIdsString: string,  // Expect `delegateIds` in query
  ): Promise<void> {
    // Check if delegateIdsString is provided
    if (!delegateIdsString) {
      throw new BadRequestException('Missing delegateIds query parameter.');
    }
  
    // Convert the string of delegateIds into an array of numbers
    const delegateIds = delegateIdsString.split(',').map(id => parseInt(id, 10));
  
    // Validate the input
    if (delegateIds.some(isNaN)) {
      throw new BadRequestException('Invalid delegateIds query parameter.');
    }
  
    return this.personsService.disassociate(personId, delegateIds);
  }
  
  
  parseFilters(filters: { [key: string]: any }): { [key: string]: number[] } {
    return Object.keys(filters).reduce((acc, key) => {
      const value = filters[key];
      if (Array.isArray(value)) {
        acc[key] = value.map((v) => parseInt(v, 10)).filter((v) => !isNaN(v));
      } else if (!isNaN(parseInt(value, 10))) {
        acc[key] = [parseInt(value, 10)];
      }
      return acc;
    }, {} as { [key: string]: number[] });
  }


}
