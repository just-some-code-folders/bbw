// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Specialty } from './entities/specialties.entity';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { NullableType } from '../../../utils/types/nullable.type';
import { EntityCondition } from '../../../utils/types/entity-condition.type';
import { CreateSpecialtyDto } from './_dto/create-specialty.dto';


@Injectable()
export class SpecialtysService {
  constructor(
    @InjectRepository(Specialty)
    private specialtysRepository: Repository<Specialty>,
  ) { }

  async create(specialty: CreateSpecialtyDto): Promise<any> {
    const existingSpecialty = await this.specialtysRepository.findOne({
      where: [{ name: specialty.name }, { abreviation: specialty.abreviation }],
    });
  
    if (existingSpecialty) {
      throw new BadRequestException(
        'A specialty with this name or abbreviation already exists.',
      );
    }
  
    return this.specialtysRepository.save(
      this.specialtysRepository.create(specialty),
    );
  }

  async findManyWithPagination(
    options: IPaginationOptions & { search?: string },
  ): Promise<[Specialty[], number]> {
    const queryBuilder = this.specialtysRepository.createQueryBuilder('specialty');
  
    // Order by specialty name alphabetically (before filtering)
    queryBuilder.orderBy('specialty.name', 'ASC');
  
    // Apply search filter (case-insensitive)
    if (options.search) {
      const searchLowerCase = options.search.toLowerCase(); // Convert search term to lowercase
      queryBuilder.andWhere(
        'LOWER(specialty.name) LIKE :search', 
        { search: `%${searchLowerCase}%` }, // Use the lowercase search term
      );
    }
  
    // Apply pagination
    queryBuilder.skip((options.page - 1) * options.limit).take(options.limit);
  
    // Execute the query
    const [data, totalCount] = await queryBuilder.getManyAndCount();
  
    return [data, totalCount];
  }
  
  
  findOne(fields: EntityCondition<Specialty>): Promise<NullableType<Specialty>> {
    return this.specialtysRepository.findOne({
      where: fields,
    });
  }

  update(id: Specialty['id'], payload: DeepPartial<Specialty>): Promise<Specialty> {
    return this.specialtysRepository.save(
      this.specialtysRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async delete(id: Specialty['id']): Promise<void> {
    await this.specialtysRepository.delete(id);
  }
}
