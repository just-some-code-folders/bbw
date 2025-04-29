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
    FileTypeValidator,
    ParseFilePipe,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
  import { SamplesService } from './samples.service';
  
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { Roles } from '../../roles/roles.decorator';
  import { RoleEnum } from '../../roles/roles.enum';
  import { AuthGuard } from '@nestjs/passport';
  import { RolesGuard } from '../../roles/roles.guard';
  import { infinityPagination } from '../../utils/infinity-pagination';
  import { Sample } from './entities/samples.entity';
  import { InfinityPaginationResultType } from '../../utils/types/infinity-pagination-result.type';
  import { NullableType } from '../../utils/types/nullable.type';
import { CreateSampleDto } from './_dto/create-sample.dto';
import { UpdateSampleDto } from './_dto/update-sample.dto';
import { FilterSampleDto } from './_dto/filter-sample.dto';
import { FileInterceptor } from '@nestjs/platform-express';
  
  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiTags('Samples')
  @Controller({
    path: 'samples',
    version: '1',
  })
  export class SamplesController {
    constructor(private readonly samplesService: SamplesService) { }
  
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createProfileDto: CreateSampleDto): Promise<Sample> {
      return this.samplesService.create(createProfileDto);
    }
  
    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query() query: any // Capture all query params for filtering
    ): Promise<InfinityPaginationResultType<Sample>> {
      if (limit > 50) {
        limit = 50;
      }
    
      const { page: ignorePage, limit: ignoreLimit, ...filters } = query; // Separate page and limit from filters
      const [data, totalCount] = await this.samplesService.findManyWithPagination(
        { page, limit },
        filters
      );
    
      return infinityPagination(data, { page, limit }, totalCount);
    }
    
  
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(@Param('id') id: string): Promise<NullableType<Sample>> {
      return this.samplesService.findOne({ id: +id });
    }
  
  
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    update(
      @Param('id') id: number,
      @Body() updateProfileDto: UpdateSampleDto,
    ): Promise<Sample> {
      return this.samplesService.update(id, updateProfileDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: number): Promise<void> {
      return this.samplesService.delete(id);
    }
  
    @Post('filter')
    @HttpCode(HttpStatus.OK)
    filter(
      @Body() filterSampleDto: FilterSampleDto,
    ): Promise<Sample[]> {
      return this.samplesService.filter(filterSampleDto);
    }

    @Post('import')
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
      return this.samplesService.importSamples(file.buffer, format);
    }
  }
  