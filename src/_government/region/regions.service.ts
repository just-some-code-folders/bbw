// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from '../../utils/types/entity-condition.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { Region } from './entities/regions.entity';
import { NullableType } from '../../utils/types/nullable.type';
import { FilterRegionDto } from './_dto/filter-region.dto';
import { RegionDto } from './_dto/region.dto';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
  ) { }

  create(region: any): Promise<any> {
    return this.regionsRepository.save(
      this.regionsRepository.create(region),
    );
  }
  
  async findManyWithPagination(
    options: IPaginationOptions & { search?: string; governmentIds?: number[] },
  ): Promise<[Region[], number]> {
    const queryBuilder = this.regionsRepository.createQueryBuilder('region');
  
    // Join the government relation
    queryBuilder.leftJoinAndSelect('region.government', 'government');
  
    // Order by region name alphabetically (before filtering)
    queryBuilder.orderBy('region.name', 'ASC');
  
    // Apply search filter (case-insensitive)
    if (options.search) {
      const searchLowerCase = options.search.toLowerCase(); // Convert search term to lowercase
      queryBuilder.andWhere(
        '(LOWER(region.name) LIKE :search OR LOWER(government.name) LIKE :search)',
        { search: `%${searchLowerCase}%` }, // Use the lowercase search term
      );
    }
  
    // Filter by multiple government IDs
    if (options.governmentIds && options.governmentIds.length > 0) {
      queryBuilder.andWhere('region.governmentId IN (:...governmentIds)', {
        governmentIds: options.governmentIds, // Use the array of government IDs
      });
    }
  
    // Apply pagination
    queryBuilder.skip((options.page - 1) * options.limit).take(options.limit);
  
    // Execute the query
    const [data, totalCount] = await queryBuilder.getManyAndCount();
  
    return [data, totalCount];
  }
  
  findOne(fields: EntityCondition<Region>): Promise<NullableType<Region>> {
    return this.regionsRepository.findOne({
      where: fields,
      relations: ['government'], // Load the government relation
    });
  }

  update(id: Region['id'], payload: DeepPartial<Region>): Promise<Region> {
    return this.regionsRepository.save(
      this.regionsRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async delete(id: Region['id']): Promise<void> {
    await this.regionsRepository.delete(id);
  }

  filter(filterOptions: FilterRegionDto): Promise<Region[]> {
    const whereCondition: FindOptionsWhere<Region> = {};

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

    return this.regionsRepository.find({ where: whereCondition });
  }
}
