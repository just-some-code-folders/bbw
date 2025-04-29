// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { ApiProperty } from '@nestjs/swagger';
import { Government } from '../../../_government/entities/governments.entity';
import { Person } from '../../../_person/_entities/persons.entity';
import { Report } from '../../../report/entities/reports.entity';
import { EntityHelper } from '../../../utils/entity-helper';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Region extends EntityHelper {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: () => Number, description: 'id of region', example: 1 })
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Government, government => government.regions)
  government: Government;

  @OneToMany(() => Person, person => person.government)
  persons: Person[];

  @OneToMany(() => Report, report => report.region)
  reports: Report[];
}
