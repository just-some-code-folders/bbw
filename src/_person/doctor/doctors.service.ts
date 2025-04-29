// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from '../../utils/types/entity-condition.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DeepPartial, Repository } from 'typeorm';
import { NullableType } from '../../utils/types/nullable.type';
import { Doctor } from './_entities/doctors.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
  ) { }

  create(doctor: any): Promise<any> {
    return this.doctorsRepository.save(
      this.doctorsRepository.create(doctor),
    );
  }

  findManyWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<Doctor[]> {
    return this.doctorsRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }

  findOne(fields: EntityCondition<Doctor>): Promise<NullableType<Doctor>> {
    return this.doctorsRepository.findOne({
      where: fields,
    });
  }

  update(id: Doctor['id'], payload: DeepPartial<Doctor>): Promise<Doctor> {
    return this.doctorsRepository.save(
      this.doctorsRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async delete(id: Doctor['id']): Promise<void> {
    await this.doctorsRepository.delete(id);
  }
}
