// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from '../utils/types/entity-condition.type';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { Government } from './entities/governments.entity';
import { NullableType } from '../utils/types/nullable.type';
import { FilterGovernmentDto } from './_dto/filter-government.dto';

@Injectable()
export class GovernmentsService {
  constructor(
    @InjectRepository(Government)
    private governmentsRepository: Repository<Government>,
  ) { }

  create(government: any): Promise<any> {
    return this.governmentsRepository.save(
      this.governmentsRepository.create(government),
    );
  }

  async findManyWithPagination(options: IPaginationOptions): Promise<[Government[], number]> {
    const [data, totalCount] = await this.governmentsRepository.findAndCount({
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      order: {
        name: 'ASC', // Order by the `name` field alphabetically
      },
    });
  
    return [data, totalCount];
  }
  
  findOne(fields: EntityCondition<Government>): Promise<NullableType<Government>> {
    return this.governmentsRepository.findOne({
      where: fields,
    });
  }

  update(id: Government['id'], payload: DeepPartial<Government>): Promise<Government> {
    return this.governmentsRepository.save(
      this.governmentsRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async delete(id: Government['id']): Promise<void> {
    await this.governmentsRepository.delete(id);
  }

  filter(filterOptions: FilterGovernmentDto): Promise<Government[]> {
    const whereCondition: FindOptionsWhere<Government> = {};

    for (const [key, value] of Object.entries(filterOptions)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && 'id' in value) {
          whereCondition[key] = { id: value.id };
        } else {
          whereCondition[key] = value;
        }
      }
    }

    return this.governmentsRepository.find({ where: whereCondition });
  }
}
