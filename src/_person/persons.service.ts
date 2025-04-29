// @preserve Copyright (c) 2025 Inspire. All rights reserved.

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from '../utils/types/entity-condition.type';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Brackets, DeepPartial, FindOptionsWhere, ILike, In, Not, Repository, WhereExpressionBuilder } from 'typeorm';
import { NullableType } from '../utils/types/nullable.type';
import { Person } from './_entities/persons.entity';
import { CreatePersonDto } from './_dto/create-person.dto';
import { FilterPersonDto } from './_dto/filter-person.dto';
import { parse } from 'csv-parse/sync';
import { Delegate } from '../_delegate/entities/delegates.entity';
import { Government } from 'src/_government/entities/governments.entity';
import { Region } from 'src/_government/region/entities/regions.entity';
import { Specialty } from './doctor/specialty/entities/specialties.entity';
import { ImportGateway } from '../socket/import.gateway';

@Injectable()
export class PersonsService {
  constructor(
    private readonly importGateway: ImportGateway,
    @InjectRepository(Person)
    private personsRepository: Repository<Person>,
    @InjectRepository(Specialty)
    private specialtysRepository: Repository<Specialty>,
    @InjectRepository(Delegate)
    private delegatesRepository: Repository<Delegate>,
    @InjectRepository(Government)
    private governmentsRepository: Repository<Government>,
    @InjectRepository(Region)
    private regionsRepository: Repository<Region>,
  ) { }

  async create(createPersonDto: CreatePersonDto): Promise<Person> {

    const person = this.personsRepository.create(createPersonDto);

    // Determine the type based on the presence of associated entities
    if (createPersonDto.doctor) {
      person.type = 1; // Type 1 for Doctor
    } else if (createPersonDto.pharmacien) {
      person.type = 2; // Type 2 for Pharmacien
    } else if (createPersonDto.wholesaler) {
      person.type = 3; // Type 3 for Wholesaler
    } else {
      // Handle cases where no type is applicable
      throw new Error('Person type could not be determined.');
    }

    return await this.personsRepository.save(person);
  }

  async getByType(
    type: number,
    page: number,
    limit: number,
    filters?: any,
    search?: string,
  ): Promise<{ data: Person[]; total: number }> {
    let relations: string[] = [];

    // Determine relations based on type
    switch (type) {
      case 1: // Doctor
        relations = ['doctor', 'doctor.specialty'];
        break;
      case 2: // Pharmacien
        relations = ['pharmacien'];
        break;
      case 3: // Wholesaler
        relations = ['wholesaler'];
        break;
      default:
        throw new Error('Invalid person type');
    }

    const query = this.personsRepository.createQueryBuilder('person')
      .leftJoinAndSelect('person.government', 'government')
      .leftJoinAndSelect('person.region', 'region')
      .leftJoinAndSelect('person.doctor', 'doctor') // Join the doctor entity
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('person.pharmacien', 'pharmacien')
      .leftJoinAndSelect('person.wholesaler', 'wholesaler')
      .where('person.type = :type', { type })
      .orderBy('person.id', 'ASC');

    // Apply filters specific to type
    if (filters?.doctorType && type === 1) {
      console.log("doc type: ", filters.doctorType);
      query.andWhere('doctor.doctorType = :doctorType', { doctorType: filters.doctorType[0] });
    }
    if (filters?.pharmacyType && type === 2) {
      query.andWhere('pharmacien.pharmacyType = :pharmacyType', { pharmacyType: filters.pharmacyType[0] });
    }

    // Apply search filter using applySearch
    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          const searchFields = ['firstname', 'lastname', 'address', 'email', 'phoneNumber'];
          this.applyDbSearch(search, qb, searchFields, 'person');
        }),
      );
    }

    // Apply other filters dynamically (filtering by IDs now)
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (key === 'doctorType' || key === 'pharmacyType') return; // Skip handled filters

        const filterValue = filters[key];

        if (Array.isArray(filterValue)) {
          switch (key) {
            case 'specialty':
              if (type === 1) {
                // Filter by specialty IDs (for doctors)
                query.andWhere('specialty.id IN (:...specialties)', { specialties: filterValue });
              }
              break;
            case 'government':
              // Filter by government IDs
              query.andWhere('government.id IN (:...governments)', { governments: filterValue });
              break;
            case 'firstname':
            case 'lastname':
              // Filter by person IDs, assuming these are ID fields
              query.andWhere(`person.${key} IN (:...${key}s)`, { [`${key}s`]: filterValue });
              break;
            default:
              query.andWhere(`person.${key} IN (:...values)`, { values: filterValue });
          }
        } else {
          switch (key) {
            case 'specialty':
              if (type === 1) {
                // Filter by specialty ID (for doctors)
                query.andWhere('specialty.id = :specialty', { specialty: filterValue });
              }
              break;
            case 'government':
              // Filter by government ID
              query.andWhere('government.id = :government', { government: filterValue });
              break;
            case 'firstname':
            case 'lastname':
              // Filter by person ID, assuming these are ID fields
              query.andWhere(`person.${key} = :${key}`, { [key]: filterValue });
              break;
            default:
              query.andWhere(`person.${key} = :${key}`, { [key]: filterValue });
          }
        }
      });
    }

    // Apply sorting first (by ID in ascending order)

    // Apply pagination
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    // Execute query and get results with count
    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }



  async getByDelegate(
    delegateId: number,
    typeIds: number[], // Accept an array of typeIds
    options: IPaginationOptions,
    filters?: any, // Dynamic filters
    search?: string, // Optional search term
  ): Promise<{ data: Person[]; total: number }> {
    const offset = (options.page - 1) * options.limit;

    // Map typeIds to their corresponding relations
    const typeRelationsMap: Record<number, string[]> = {
      1: ['doctor', 'doctor.specialty'],
      2: ['pharmacien'],
      3: ['wholesaler'],
    };

    // Determine relations based on provided typeIds
    const relations = typeIds
      .flatMap((typeId) => typeRelationsMap[typeId] || [])
      .filter(Boolean);

    if (!relations.length) {
      throw new Error('Invalid person types');
    }

    // Build query for fetching persons assigned to the delegate
    const query = this.personsRepository.createQueryBuilder('person')
      .leftJoinAndSelect('person.delegates', 'delegates')
      .leftJoinAndSelect('person.government', 'government')
      .leftJoinAndSelect('person.region', 'region')
      .leftJoinAndSelect('person.doctor', 'doctor')
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('person.pharmacien', 'pharmacien')
      .leftJoinAndSelect('person.wholesaler', 'wholesaler')
      .where('delegates.id = :delegateId', { delegateId })
      .andWhere('person.type IN (:...typeIds)', { typeIds })
      .orderBy('person.id', 'ASC');

    // Apply search filter using applyDbSearch
    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          const searchFields = ['firstname', 'lastname', 'address', 'email', 'phoneNumber'];
          this.applyDbSearch(search, qb, searchFields, 'person');
        }),
      );
    }

    // Apply dynamic filters
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const filterValue = filters[key];

        if (Array.isArray(filterValue)) {
          switch (key) {
            case 'specialty':
              if (typeIds.some((id) => id === 1)) {
                query.andWhere('specialty.id IN (:...specialties)', { specialties: filterValue });
              }
              break;
            case 'government':
              query.andWhere('government.id IN (:...governments)', { governments: filterValue });
              break;
            case 'region':
              query.andWhere('region.id IN (:...regions)', { regions: filterValue });
              break;
            default:
              query.andWhere(`person.${key} IN (:...values)`, { values: filterValue });
          }
        } else {
          switch (key) {
            case 'specialty':
              if (typeIds.some((id) => id === 1)) {
                query.andWhere('specialty.id = :specialty', { specialty: filterValue });
              }
              break;
            case 'government':
              query.andWhere('government.id = :government', { government: filterValue });
              break;
            case 'region':
              query.andWhere('region.id = :region', { region: filterValue });
              break;
            default:
              query.andWhere(`person.${key} = :${key}`, { [key]: filterValue });
          }
        }
      });
    }

    // Apply pagination
    query.skip(offset).take(options.limit);

    // Execute query and get results with count
    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async findManyWithPagination(options: IPaginationOptions & { filters?: any }): Promise<[Person[], number]> {
    const query = this.personsRepository.createQueryBuilder('person');

    // Dynamically add conditions based on filters
    if (options.filters) {
      Object.keys(options.filters).forEach((key) => {
        // Skip pagination-related params
        if (key !== 'page' && key !== 'limit') {
          query.andWhere(`person.${key} LIKE :${key}`, { [key]: `%${options.filters[key]}%` });
        }
      });
    }

    query.skip((options.page - 1) * options.limit).take(options.limit);

    const [data, totalCount] = await query.getManyAndCount();

    return [data, totalCount];
  }

  async findOne(fields: EntityCondition<Person>): Promise<NullableType<Person>> {
    // Determine the relation to load based on the type
    const person = await this.personsRepository.findOne({
      where: fields,
    });

    if (!person) {
      return null; // Or handle not found logic
    }

    const relations = {
      1: ['doctor'],
      2: ['pharmacien'],
      3: ['wholesaler']
    };

    // Determine the relation to load based on the type
    const typeRelation = relations[person.type];

    // Fetch the person with the determined relation
    return this.personsRepository.findOne({
      where: fields,
      relations: typeRelation
    });
  }


  update(id: Person['id'], payload: DeepPartial<Person>): Promise<Person> {
    return this.personsRepository.save(
      this.personsRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async delete(id: Person['id']): Promise<void> {
    await this.personsRepository.delete(id);
  }

  filter(filterOptions: FilterPersonDto): Promise<Person[]> {
    const whereCondition: FindOptionsWhere<Person> = {};

    for (const [key, value] of Object.entries(filterOptions)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && 'id' in value) {
          whereCondition[key] = { id: value.id };
        } else {
          whereCondition[key] = value;
        }
      }
    }

    return this.personsRepository.find({ where: whereCondition });
  }

  async importPersons(data: Buffer | string, format: 'csv' | 'json', type: 'doctor' | 'mixed'): Promise<void> {
    this.importGateway.sendLog(`Début de l'import`);
    try {
      let personsArray: any[];

      // Parse the input data
      if (format === 'csv') {
        personsArray = parse(data.toString().toLowerCase(), {
          columns: true, // Use first row as keys
          skip_empty_lines: true, // Skip empty lines
        });
      } else {
        throw new Error('Unsupported format');
      }

      const totalPersons = personsArray.length;
      let processedCount = 0;


      // Process each person in the array
      for (const person of personsArray) {
        this.importGateway.sendLog(`Personne: ${person.name}`);
        const governmentName = person.government?.trim() || 'Unknown';
        const regionName = person.region?.trim() || governmentName;
        const fullName = person.name?.trim() || person.firstname?.trim() || 'Unknown Unknown';
        const nameParts = fullName.split(' ');
        const lastName = nameParts.pop() || 'Unknown';
        const firstName = nameParts.join(' ') || 'Unknown';

        // Fetch or create Government
        let government = await this.governmentsRepository.findOne({
          where: { name: ILike(governmentName.trim()) }, // Ensure case-insensitive search
        });

        // If government not found, check if 'Unknown' exists and reuse its ID, else create a new 'Unknown'
        if (!government) {
          this.importGateway.sendLog(`Gouvernorat non trouvé: ${governmentName.trim()}.`);

          // Try to find the 'Unknown' government, ensuring case sensitivity is handled correctly
          government = await this.governmentsRepository.findOne({
            where: { name: 'unknown' },
          });

          if (!government) {
            console.warn(`'Unknown' government not found. Creating 'Unknown'.`);
            government = await this.governmentsRepository.save({ name: 'unknown' });
          }
        }

        // Fetch or create Region
        let region = await this.regionsRepository.findOne({
          where: {
            name: ILike(regionName.trim()), // Ensure case-insensitive search
            government: { id: government.id },
          },
        });

        if (!region) {
          region = await this.regionsRepository.save({
            name: regionName.trim(), // Trim any extra spaces
            government: { id: government.id },
          });
          this.importGateway.sendLog(`Région créée: ${regionName.trim()} sous le gouvernorat: ${government.id}`);
        }

        const progress = Math.round((processedCount / totalPersons) * 100);
        processedCount++;

        // Emit progress update to the client
        this.importGateway.sendProgress(progress);

        // Determine entity type (Doctor, Pharmacien, or Wholesaler)
        let transformedPerson: any;
        if (type === 'doctor') {
          const specialtyName = person.specialty?.trim();
          let specialty = await this.specialtysRepository.findOne({
            where: { name: ILike(specialtyName) },
          });

          if (!specialty) {
            try {
              specialty = await this.specialtysRepository.save({
                name: specialtyName,
                abreviation: specialtyName?.substring(0, 3).toUpperCase() || 'UNK',
              });
              this.importGateway.sendLog(`Spécialté créée: ${specialtyName}`);
            } catch (error) {
              this.importGateway.sendLog(`Erreur lors de la création de la spécialité: ${specialtyName}`);
              specialty = null; // Ensure specialty remains null and the process continues
            }
          }
          

          transformedPerson = {
            firstname: firstName,
            lastname: lastName,
            address: person.address?.replace(/\n/g, ' ') || 'Unknown',
            phoneNumber: person.phonenumber || person.tel || 'Unknown',
            email: person.email || 'Unknown',
            type: 1, // Doctor
            potential: person.potential || null,
            code: person.code || null,
            doctor: {
              specialty: specialty ? { id: specialty.id } : undefined,
            },
            government: { id: government.id },
            region: { id: region.id },
          };
        } else if (/pharmacie|pharma|ph|para/i.test(fullName)) {
          transformedPerson = {
            firstname: firstName,
            lastname: lastName,
            address: person.address?.replace(/\n/g, ' ') || 'Unknown',
            phoneNumber: person.phonenumber || person.tel || 'Unknown',
            email: person.email || 'Unknown',
            type: 2, // Pharmacien
            potential: person.potential || null,
            code: person.code || null,
            pharmacien: {
              pharmacyName: fullName,
            },
            government: { id: government.id },
            region: { id: region.id },
          };
        } else {
          transformedPerson = {
            firstname: firstName,
            lastname: lastName,
            address: person.address?.replace(/\n/g, ' ') || 'Unknown',
            phoneNumber: person.phonenumber || person.tel || 'Unknown',
            email: person.email || 'Unknown',
            type: 3, // Wholesaler
            potential: person.potential || null,
            code: person.code || null,
            wholesaler: {
              companyName: fullName,
            },
            government: { id: government.id },
            region: { id: region.id },
          };
        }

        // Check for existing person
        const existingPerson = await this.personsRepository.findOne({
          where: {
            firstname: firstName,
            lastname: lastName,
            region: { id: region.id },
          },
        });


        if (existingPerson) {
          this.importGateway.sendLog(`Personne existante: ${fullName}. Recherche de champs non à jour.`);

          // Update missing or outdated fields from the CSV
          if (person.code && existingPerson.code !== person.code) {
            existingPerson.code = person.code;
            this.importGateway.sendLog(`Updated code`);
          }

          if (person.email && existingPerson.email !== person.email) {
            existingPerson.email = person.email;
            this.importGateway.sendLog(`Updated email`);
          }

          if (person.address && existingPerson.address !== person.address) {
            existingPerson.address = person.address;
            this.importGateway.sendLog(`Updated address`);
          }

          if (person.potential && existingPerson.potential !== person.potential.toLowerCase()) {
            existingPerson.potential = person.potential;
            this.importGateway.sendLog(`Updated potential`);
          }
          // Save the updated person
          await this.personsRepository.save(existingPerson);
          this.importGateway.sendLog(`Personne mise à jour: ${fullName}`);
          continue;
        }

        // Save the transformed new person
        await this.personsRepository.save(transformedPerson);

        // Log the result
        console.log('Saved Transformed Person:', transformedPerson);



      }
    } catch (error) {
      console.error('Error processing data:', error.message);
    }
  }

  async getByTypeForExport(type: number): Promise<Person[]> {
    let relations: string[] = [];

    // Determine relations based on type
    switch (type) {
      case 1:
        relations = ['doctor'];
        break;
      case 2:
        relations = ['pharmacien'];
        break;
      case 3:
        relations = ['wholesaler'];
        break;
      default:
        throw new Error('Invalid person type');
    }

    // Fetch all data based on type
    return this.personsRepository.find({
      where: { type },
      relations,
    });
  }

  exportData(data: Person[], format: string): Buffer {
    if (format === 'csv') {
      return this.convertToCSV(data);
    } else {
      throw new Error('Unsupported format');
    }
  }

  convertToCSV(data: Person[]): Buffer {
    const fields = ['id', 'firstname', 'lastname', 'address', 'phoneNumber', 'email', 'type', 'doctorId', 'pharmacienId', 'wholesalerId', 'delegateId', 'governmentId', 'regionId'];
    const header = fields.join(',');
    const rows = data.map(person =>
      fields.map(field => person[field] || '').join(',')
    );
    return Buffer.from([header, ...rows].join('\n'));
  }

  async disassociate(delegateId: number, personsIds: any[]): Promise<void> {
    // If only one personId is provided, treat it as a single ID
    if (personsIds.length === 1) {
      personsIds = personsIds[0] instanceof Array ? personsIds : [personsIds[0]];
    }

    // Iterate through each personId and update the relationships
    for (const personId of personsIds) {
      const person = await this.personsRepository.findOne({
        where: { id: personId },
        relations: ['delegates'],
      });

      if (!person) {
        throw new Error(`Person with ID ${personId} not found`);
      }

      // Remove the delegate from the person's delegates list
      person.delegates = person.delegates.filter(
        delegate => delegate.id !== delegateId,
      );

      // Save the updated person
      await this.personsRepository.save(person);
    }
  }


  async getNonAssigned(
    delegateId: number,
    typeId: number,
    options: IPaginationOptions,
    filters?: any,
    search?: string
  ): Promise<{ data: Person[]; total: number }> {
    let relations: string[] = [];

    // Set relations based on typeId
    switch (typeId) {
      case 1:
        relations = ['doctor', 'doctor.specialty'];
        break;
      case 2:
        relations = ['pharmacien'];
        break;
      case 3:
        relations = ['wholesaler'];
        break;
      default:
        throw new Error('Invalid person type');
    }

    // Fetch all data without pagination first
    const [data] = await this.personsRepository.findAndCount({
      where: {
        type: typeId, // Filter based on typeId
      },
      order: {
        id: 'DESC'
      },
      relations: ['delegates', ...relations], // Include the delegates and other relations
    });

    // Filter out the persons who have the delegateId in their delegates array
    let filteredData = data.filter(person =>
      !person.delegates.some(delegate => delegate.id === delegateId)
    );

    // Apply search filter if provided
    if (search) {
      filteredData = this.applySearch(search, filteredData, ['firstname', 'lastname', 'address', 'email', 'phoneNumber']);
    }

    // Apply other filters dynamically
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const filterValue = Array.isArray(filters[key])
          ? filters[key].map((value: any) => (typeof value === 'string' ? parseInt(value, 10) : value))
          : (typeof filters[key] === 'string' ? parseInt(filters[key], 10) : filters[key]);

        if (Array.isArray(filterValue)) {
          switch (key) {
            case 'specialty':
              if (typeId === 1) {
                filteredData = filteredData.filter(person =>
                  person.doctor && filterValue.includes(person.doctor.specialty.id)
                );
              }
              break;
            case 'government':
              filteredData = filteredData.filter(person =>
                filterValue.includes(person.government.id)
              );
              break;
            case 'region':
              filteredData = filteredData.filter(person =>
                filterValue.includes(person.region.id)
              );
              break;
            default:
              filteredData = filteredData.filter(person =>
                filterValue.includes(person[key])
              );
          }
        } else {
          switch (key) {
            case 'specialty':
              if (typeId === 1) {
                filteredData = filteredData.filter(person =>
                  person.doctor && person.doctor.specialty.id === filterValue
                );
              }
              break;
            case 'government':
              filteredData = filteredData.filter(person =>
                person.government.id === filterValue
              );
              break;
            case 'region':
              filteredData = filteredData.filter(person =>
                person.region.id === filterValue
              );
              break;
            default:
              filteredData = filteredData.filter(person =>
                person[key] === filterValue
              );
          }
        }
      });
    }

    // Apply pagination to the filtered data
    const paginatedData = filteredData.slice(
      (options.page - 1) * options.limit,
      options.page * options.limit
    );

    const total = filteredData.length;

    // Return the filtered and paginated data along with the total count
    return {
      data: paginatedData,
      total,
    };
  }

  applySearch<T extends Record<string, any>>(
    search: string,
    data: T[],
    keys: (keyof T)[]
  ): T[] {
    if (!search) return data;

    // Trim and split the search into tokens
    const tokens = search.trim().toLowerCase().split(' ').filter(Boolean);

    return data.filter((item) =>
      tokens.every((token) =>
        keys.some((key) => item[key]?.toString().toLowerCase().includes(token))
      )
    );
  }

  applyDbSearch(
    search: string,
    qb: WhereExpressionBuilder,
    fields: string[],
    alias: string
  ) {
    // Trim and split the search into tokens
    const tokens = search.trim().toLowerCase().split(' ').filter(Boolean);

    tokens.forEach((token) => {
      qb.andWhere(
        new Brackets((subQb) => {
          fields.forEach((field) => {
            subQb.orWhere(`LOWER(${alias}.${field}) LIKE :token`, { token: `%${token}%` });
          });
        }),
      );
    });
  }

}

