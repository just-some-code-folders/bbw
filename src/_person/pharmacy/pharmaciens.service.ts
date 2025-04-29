// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from '../../utils/types/entity-condition.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DeepPartial, Repository } from 'typeorm';
import { NullableType } from '../../utils/types/nullable.type';
import { Pharmacien } from './entities/pharmaciens.entity';

@Injectable()
export class PharmaciensService {
  constructor(
    @InjectRepository(Pharmacien)
    private pharmaciensRepository: Repository<Pharmacien>,
  ) { }

  create(pharmacien: any): Promise<any> {
    return this.pharmaciensRepository.save(
      this.pharmaciensRepository.create(pharmacien),
    );
  }

  findManyWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<Pharmacien[]> {
    return this.pharmaciensRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }

  findOne(fields: EntityCondition<Pharmacien>): Promise<NullableType<Pharmacien>> {
    return this.pharmaciensRepository.findOne({
      where: fields,
    });
  }

  update(id: Pharmacien['id'], payload: DeepPartial<Pharmacien>): Promise<Pharmacien> {
    return this.pharmaciensRepository.save(
      this.pharmaciensRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async delete(id: Pharmacien['id']): Promise<void> {
    await this.pharmaciensRepository.delete(id);
  }
}
