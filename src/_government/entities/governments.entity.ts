// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { Region } from '../region/entities/regions.entity';
import { Person } from '../../_person/_entities/persons.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Report } from '../../report/entities/reports.entity';

@Entity()
export class Government extends EntityHelper {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: () => Number, description: 'id of government', example: 1 })
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Region, region => region.government)
  regions: Region[];

  @OneToMany(() => Person, person => person.government)
  persons: Person[];

  @OneToMany(() => Report, report => report.government)
  reports: Report[];
}
