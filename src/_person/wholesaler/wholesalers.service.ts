// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from '../../utils/types/entity-condition.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DeepPartial, Repository } from 'typeorm';
import { NullableType } from '../../utils/types/nullable.type';
import { Wholesaler } from './entities/wholesalers.entity';

@Injectable()
export class WholesalersService {
  constructor(
    @InjectRepository(Wholesaler)
    private wholesalersRepository: Repository<Wholesaler>,
  ) { }

  create(wholesaler: any): Promise<any> {
    return this.wholesalersRepository.save(
      this.wholesalersRepository.create(wholesaler),
    );
  }

  findManyWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<Wholesaler[]> {
    return this.wholesalersRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }

  findOne(fields: EntityCondition<Wholesaler>): Promise<NullableType<Wholesaler>> {
    return this.wholesalersRepository.findOne({
      where: fields,
    });
  }

  update(id: Wholesaler['id'], payload: DeepPartial<Wholesaler>): Promise<Wholesaler> {
    return this.wholesalersRepository.save(
      this.wholesalersRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async delete(id: Wholesaler['id']): Promise<void> {
    await this.wholesalersRepository.delete(id);
  }
}
