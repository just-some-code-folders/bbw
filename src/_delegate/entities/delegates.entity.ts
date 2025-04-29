// @preserve Copyright (c) 2025 Inspire. All rights reserved.

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { Person } from '../../_person/_entities/persons.entity';
import { User } from 'src/users/entities/user.entity';
import { Report } from 'src/report/entities/reports.entity';

@Entity()
export class Delegate extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  phoneNumber: string;

  @Column()
  address: string;

  @ManyToMany(() => Person, person => person.delegates)
  persons: Person[];

  @OneToMany(() => User, user => user.delegate)
  users: User[];

  @OneToMany(() => Report, report => report.delegate)
  reports: Report[];
}
