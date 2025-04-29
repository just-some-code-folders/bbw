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
} from '@nestjs/common';
import { ProductsService } from './products.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../roles/roles.decorator';
import { RoleEnum } from '../../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../roles/roles.guard';
import { infinityPagination } from '../../utils/infinity-pagination';
import { Product } from './entities/products.entity';
import { InfinityPaginationResultType } from '../../utils/types/infinity-pagination-result.type';
import { NullableType } from '../../utils/types/nullable.type';
import { CreateProductDto } from './_dto/create-product.dto';
import { UpdateProductDto } from './_dto/update-product.dto';
import { FilterProductDto } from './_dto/filter-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Products')
@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }


  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProfileDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query() query: any // Capture all query params for filtering
  ): Promise<InfinityPaginationResultType<Product>> {
    if (limit > 50) {
      limit = 50;
    }

    const { page: ignorePage, limit: ignoreLimit, ...filters } = query; // Separate page and limit from filters
    const [data, totalCount] = await this.productsService.findManyWithPagination(
      { page, limit },
      filters
    );

    return infinityPagination(data, { page, limit }, totalCount);
  }


  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<NullableType<Product>> {
    return this.productsService.findOne({ id: +id });
  }


  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: number,
    @Body() updateProfileDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number): Promise<void> {
    return this.productsService.delete(id);
  }

  @Post('filter')
  @HttpCode(HttpStatus.OK)
  filter(
    @Body() filterProductDto: FilterProductDto,
  ): Promise<Product[]> {
    return this.productsService.filter(filterProductDto);
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
    return this.productsService.importProducts(file.buffer, format);
  }
}
