import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from '../utils/types/entity-condition.type';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Brackets, DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { Report } from './entities/reports.entity';
import { NullableType } from '../utils/types/nullable.type';
import { FilterReportDto } from './_dto/filter-report.dto';
import { CreateReportDto } from './_dto/create-report.dto';
import { Government } from 'src/_government/entities/governments.entity';
import { Person } from 'src/_person/_entities/persons.entity';
import { Region } from 'src/_government/region/entities/regions.entity';
import { Product } from './_products/entities/products.entity';
import { Sample } from './_samples/entities/samples.entity';
import { Delegate } from 'src/_delegate/entities/delegates.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    @InjectRepository(Government)
    private governmentsRepository: Repository<Government>,
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
    @InjectRepository(Person)
    private personsRepository: Repository<Person>,
    @InjectRepository(Sample)
    private samplesRepository: Repository<Sample>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Delegate)
    private delegateRepository: Repository<Delegate>,
  ) { }

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const government = await this.governmentsRepository.findOne({ where: { id: createReportDto.governmentId } });
    const region = await this.regionsRepository.findOne({ where: { id: createReportDto.regionId } });
    const person = await this.personsRepository.findOne({ where: { id: createReportDto.personId } });
    const delegate = await this.delegateRepository.findOne({ where: { id: createReportDto.delegateId } });

    if (!government || !region || !person || !delegate) {
      throw new Error('Invalid government, region, delegate, or person ID');
    }

    // Resolve products and samples
    const reportSamples = await Promise.all(
      createReportDto.reportSamples.map(async (sampleDto) => {
        const sample = await this.samplesRepository.findOne({ where: { id: sampleDto.sampleId } });
        if (!sample) {
          throw new Error(`Sample with ID ${sampleDto.sampleId} not found`);
        }
        return {
          ...sampleDto,
          sample,
        };
      })
    );

    const reportProducts = await Promise.all(
      createReportDto.reportProducts.map(async (productDto) => {
        const product = await this.productsRepository.findOne({ where: { id: productDto.productId } });
        if (!product) {
          throw new Error(`Product with ID ${productDto.productId} not found`);
        }
        return {
          ...productDto,
          product,
        };
      })
    );

    const reportCreation = this.reportsRepository.create({
      ...createReportDto,
      government,
      region,
      person,
      delegate,
      reportSamples,
      reportProducts,
    });

    return await this.reportsRepository.save(reportCreation);
  }

  async findManyWithPagination(
    options: IPaginationOptions,
    filters?: Record<string, any>,
    search?: string,
  ): Promise<[Report[], number]> {

    const query = this.reportsRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.government', 'government') // Include government relation
      .leftJoinAndSelect('report.region', 'region') // Include region relation
      .leftJoinAndSelect('report.person', 'person') // Include person relation
      .leftJoinAndSelect('person.doctor', 'doctor') // Include doctor relation through person
      .leftJoinAndSelect('doctor.specialty', 'specialty') // Include specialty relation through doctor
      .leftJoinAndSelect('report.delegate', 'delegate') // Include delegate relation
      .leftJoinAndSelect('report.reportSamples', 'reportSamples') // Include reportSamples relation
      .leftJoinAndSelect('report.reportProducts', 'reportProducts'); // Include reportProducts relation

    // Apply ordering by ID in descending order (as needed)
    query.orderBy('report.id', 'DESC'); // Ensure data is ordered by id DESC before any filters

    // Apply search filter (case-insensitive)
    if (search) {
      const searchLowerCase = search.toLowerCase();
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(report.name) LIKE :search', { search: `%${searchLowerCase}%` })
            .orWhere('LOWER(report.note) LIKE :search', { search: `%${searchLowerCase}%` });
        }),
      );
    }

    // Apply filters dynamically
    if (filters) {
      Object.keys(filters).forEach((key) => {
        console.log('Processing key:', key, 'with value:', filters[key]);

        const filterValue = filters[key];

        if (key === 'type') {
          // Handle filtering by person type
          if (Array.isArray(filterValue)) {
            query.andWhere('person.type IN (:...types)', { types: filterValue });
          } else {
            query.andWhere('person.type = :type', { type: filterValue });
          }
        } else if (key === 'dateInterval') {
          // Apply date range filtering
          const [fromDate, toDate] = filterValue

          if (fromDate && toDate) {
            query.andWhere('report.date BETWEEN :fromDate AND :toDate', { fromDate, toDate });
          }
        } else if (key === 'government') {
          // Handle government filtering by ID
          if (Array.isArray(filterValue)) {
            query.andWhere('government.id IN (:...governmentIds)', { governmentIds: filterValue });
          } else {
            query.andWhere('government.id = :governmentId', { governmentId: filterValue });
          }
        } else if (key === 'region') {
          // Handle region filtering by ID
          if (Array.isArray(filterValue)) {
            query.andWhere('region.id IN (:...regionIds)', { regionIds: filterValue });
          } else {
            query.andWhere('region.id = :regionId', { regionId: filterValue });
          }
        } else if (key === 'delegateId') {
          // Handle delegate filtering by ID
          if (Array.isArray(filterValue)) {
            query.andWhere('delegate.id IN (:...delegateIds)', { delegateIds: filterValue });
          } else {
            query.andWhere('delegate.id = :delegateId', { delegateId: filterValue });
          }
        } else if (key === 'specialtyId') {
          // Handle specialty filtering by ID
          if (Array.isArray(filterValue)) {
            query.andWhere('specialty.id IN (:...specialtyIds)', { specialtyIds: filterValue });
          } else {
            query.andWhere('specialty.id = :specialtyId', { specialtyId: filterValue });
          }
        } else if (key === 'sampleId') {
          // Handle filtering by reportSample ID
          if (Array.isArray(filterValue)) {
            query.andWhere('reportSamples.sampleId IN (:...reportSampleIds)', { reportSampleIds: filterValue });
          } else {
            query.andWhere('reportSamples.sampleId = :reportSampleId', { reportSampleId: filterValue });
          }
        } else if (Array.isArray(filterValue)) {
          // Handle array filters for other fields
          query.andWhere(`report.${key} IN (:...values)`, { values: filterValue });
        } else if (typeof filterValue === 'string') {
          // Handle string filters (case-insensitive search)
          query.andWhere(`LOWER(report.${key}) LIKE :value`, {
            value: `%${filterValue.toLowerCase()}%`,
          });
        } else {
          // Handle exact matches for non-string fields
          query.andWhere(`report.${key} = :value`, { value: filterValue });
        }
      });
    }

    // Apply pagination (after all other filters and sorting)
    query.skip((options.page - 1) * options.limit).take(options.limit);

    // Execute the query and get both data and total count
    const [data, totalCount] = await query.getManyAndCount();

    return [data, totalCount];
  }

  findOne(fields: EntityCondition<Report>): Promise<NullableType<Report>> {
    return this.reportsRepository.findOne({
      where: fields,
      relations: [
        'reportSamples',
        'reportSamples.sample', // Include details from the Sample entity
        'reportProducts',
        'reportProducts.product', // Include details from the Product entity
      ],
    });
  }

  update(id: Report['id'], payload: DeepPartial<Report>): Promise<Report> {
    return this.reportsRepository.save(
      this.reportsRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async delete(id: Report['id']): Promise<void> {
    await this.reportsRepository.delete(id);
  }

  filter(filterOptions: FilterReportDto): Promise<Report[]> {
    const whereCondition: FindOptionsWhere<Report> = {};

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

    return this.reportsRepository.find({ where: whereCondition });
  }
}
