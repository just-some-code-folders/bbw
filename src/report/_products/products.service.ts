import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from '../../utils/types/entity-condition.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DeepPartial, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Product } from './entities/products.entity';
import { NullableType } from '../../utils/types/nullable.type';
import { FilterProductDto } from './_dto/filter-product.dto';
import { parse } from 'csv-parse/sync';
import { ImportGateway } from 'src/socket/import.gateway';

@Injectable()
export class ProductsService {
  constructor(
    private readonly importGateway: ImportGateway,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) { }

  async create(product: Partial<Product>): Promise<any> {
    // Check for duplicates
    const existingProduct = await this.productsRepository.findOne({
      where: [
        { name: product.name },
        { barCode: product.barCode },
        { productCode: product.productCode },
      ],
    });

    if (existingProduct) {
      throw new BadRequestException(
        'A product with this name, barcode, or product code already exists.',
      );
    }

    // Save the product
    return this.productsRepository.save(
      this.productsRepository.create(product),
    );
  }
  async findManyWithPagination(
    options: IPaginationOptions,
    filters?: any
  ): Promise<[Product[], number]> {
    const query = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.report', 'report')
      .leftJoinAndSelect('product.reportProducts', 'reportProduct')
      .skip((options.page - 1) * options.limit)
      .take(options.limit);

    // Apply dynamic filters
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const filterValue = filters[key];

        if (Array.isArray(filterValue)) {
          // If the filter value is an array, use IN clause
          query.andWhere(`product.${key} IN (:...values)`, { values: filterValue });
        } else {
          // Check if the field is a string and apply case-insensitive search
          const isStringField = ['name', 'description'].includes(key); // Add any string fields you need to handle
          if (isStringField) {
            query.andWhere(`LOWER(product.${key}) LIKE :value`, { value: `%${filterValue.toLowerCase()}%` });
          } else {
            // Apply direct comparison for non-string fields
            query.andWhere(`product.${key} = :value`, { value: filterValue });
          }
        }
      });
    }

    const [data, totalCount] = await query.getManyAndCount();
    return [data, totalCount];
  }



  findOne(fields: EntityCondition<Product>): Promise<NullableType<Product>> {
    return this.productsRepository.findOne({
      where: fields,
    });
  }

  update(id: Product['id'], payload: DeepPartial<Product>): Promise<Product> {
    return this.productsRepository.save(
      this.productsRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async delete(id: Product['id']): Promise<void> {
    await this.productsRepository.delete(id);
  }

  filter(filterOptions: FilterProductDto): Promise<Product[]> {
    const whereCondition: FindOptionsWhere<Product> = {};

    console.log("whereCondition before: ", whereCondition);

    for (const [key, value] of Object.entries(filterOptions)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && 'id' in value) {
          // Handle nested objects
          whereCondition[key] = { id: value.id };
        } else {
          // Handle simple values
          whereCondition[key] = value;
        }
      }
    }

    console.log("whereCondition after: ", whereCondition);

    return this.productsRepository.find({ where: whereCondition });
  }

  async importProducts(data: Buffer | string, format: 'csv' | 'json'): Promise<void> {
    try {
      let productsArray: any[];

      let processedCount = 0;
      if (format === 'csv') {
        // Parse CSV into an array of objects
        productsArray = parse(data.toString().toLowerCase(), {
          columns: true, // Automatically use the first row as keys
          skip_empty_lines: true, // Skip empty lines
        });
      } else {
        throw new Error('Unsupported format');
      }
      const totalProducts = productsArray.length;

      // Emit progress update to the client

      for (const product of productsArray) {

        const progress = Math.round((processedCount / totalProducts) * 100);
        processedCount++;

        this.importGateway.sendProgress(progress);

        this.importGateway.sendLog(`produit: ${product.name}`);
        let existingProduct = await this.productsRepository.findOne({
          where: [
            { productCode: product.code },
            { name: product.name },
          ],
        });

        if (existingProduct) {
          this.importGateway.sendLog(`Duplication détectée: ${product.code}`);
          console.log(`Duplicate detected: ${product.code}. Skipping save.`);
          continue;
        }
        else {
          // Transform the product data
          let transformedproduct = {
            productCode: product.code || 'Unknown',
            name: product.name || 'Unknown',
            barCode: product.barcode || 'Unknown',
            family: product.family || 'Unknown',
            productCreationDate: product.productcreationdate || 'Unknown',
            price: product.price
              ? parseFloat(product.price.replace(',', '.')) || 0 // Replace comma and convert to float
              : 0, // Default to 0 if price is missing
          };

          try{
            await this.productsRepository.save(transformedproduct);

          }

          catch (error) {
            this.importGateway.sendLog(`produit existant. ${product.code} ${product.name}`);
          }
          // Save the transformed product

          // Log the transformed object
          console.log('Transformed product:', transformedproduct);
        }

      }
    } catch (error) {
      console.error('Error processing data:', error.message);
    }
  }

}
