import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from '../../utils/types/entity-condition.type';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { Sample } from './entities/samples.entity';
import { NullableType } from '../../utils/types/nullable.type';
import { FilterSampleDto } from './_dto/filter-sample.dto';
import { parse } from 'csv-parse/sync';
import { ImportGateway } from 'src/socket/import.gateway';

@Injectable()
export class SamplesService {
  constructor(
    private readonly importGateway: ImportGateway,
    @InjectRepository(Sample)
    private samplesRepository: Repository<Sample>,
  ) { }

  async create(sample: any): Promise<any> {
    // Check for duplicates
    const existingSample = await this.samplesRepository.findOne({
      where: [{ name: sample.name }, { sampleCode: sample.sampleCode }],
    });

    if (existingSample) {
      throw new BadRequestException(
        'A sample with this name or sample code already exists.',
      );
    }

    // Save the sample
    return this.samplesRepository.save(
      this.samplesRepository.create(sample),
    );
  }
  async findManyWithPagination(
    options: IPaginationOptions,
    filters?: any
  ): Promise<[Sample[], number]> {
    const query = this.samplesRepository.createQueryBuilder('sample')
      .leftJoinAndSelect('sample.report', 'report')
      .leftJoinAndSelect('sample.reportSamples', 'reportSample')
      .skip((options.page - 1) * options.limit)
      .take(options.limit);

    // Apply dynamic filters
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const filterValue = filters[key];

        if (Array.isArray(filterValue)) {
          // If the filter value is an array, use IN clause
          query.andWhere(`sample.${key} IN (:...values)`, { values: filterValue });
        } else {
          // Apply partial match for strings or direct comparison otherwise
          query.andWhere(`sample.${key} LIKE :value`, { value: `%${filterValue}%` });
        }
      });
    }

    const [data, totalCount] = await query.getManyAndCount();
    return [data, totalCount];
  }


  findOne(fields: EntityCondition<Sample>): Promise<NullableType<Sample>> {
    return this.samplesRepository.findOne({
      where: fields,
    });
  }

  update(id: Sample['id'], payload: DeepPartial<Sample>): Promise<Sample> {
    return this.samplesRepository.save(
      this.samplesRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async delete(id: Sample['id']): Promise<void> {
    await this.samplesRepository.delete(id);
  }

  filter(filterOptions: FilterSampleDto): Promise<Sample[]> {
    const whereCondition: FindOptionsWhere<Sample> = {};

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

    return this.samplesRepository.find({ where: whereCondition });
  }

  async importSamples(data: Buffer | string, format: 'csv' | 'json'): Promise<void> {
    let processedCount = 0;

    try {
      let samplesArray: any[];

      if (format === 'csv') {
        // Parse CSV into an array of objects
        samplesArray = parse(data.toString().toLowerCase(), {
          columns: true, // Automatically use the first row as keys
          skip_empty_lines: true, // Skip empty lines
        });
      } else {
        throw new Error('Unsupported format');
      }

      const totalSamples = samplesArray.length;


      for (const sample of samplesArray) {

        const progress = Math.round((processedCount / totalSamples) * 100);
        processedCount++;

        // Emit progress update to the client
        this.importGateway.sendProgress(progress);

        this.importGateway.sendLog(`échantillon: ${sample.name}`);

        let existingSample = await this.samplesRepository.findOne({
          where: [
            { sampleCode: sample.code },
            { name: sample.name },
          ],
        });

        if (existingSample) {
          console.log("exists: ", existingSample);

          this.importGateway.sendLog(`Duplication détectée: ${sample.code}`);
          console.log(`Duplicate detected: ${sample.code}. Skipping save.`);
          continue;
        }
        else {
          // Transform the sample data
          let transformedsample = {
            sampleCode: sample.code || 'Unknown',
            name: sample.name || 'Unknown',
          };
          console.log("transformed: ", transformedsample);

          // Save the transformed sample
          try {
            await this.samplesRepository.save(transformedsample);
          } catch (error) {
            this.importGateway.sendLog(`échantillon existant. ${sample.code} ${sample.name}`);
          }
          // Log the transformed object
          console.log('Transformed sample:', transformedsample);
          this.importGateway.sendLog(`échantillon: ${sample.name} enregistré`);
        }
      }
    } catch (error) {
      console.error('Error processing data:', error.message);
    }
  }
}
