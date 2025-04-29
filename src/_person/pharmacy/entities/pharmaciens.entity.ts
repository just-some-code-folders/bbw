// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { ApiProperty } from '@nestjs/swagger';
import { Person } from '../../../_person/_entities/persons.entity';
import { EntityHelper } from '../../../utils/entity-helper';
import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';


@Entity()
export class Pharmacien extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  contact: string;


  @Column({ nullable: true })
  pharmacyType: number;

  @Column()
  @ApiProperty({ example: 'Pharmacie de Foulen' })
  pharmacyName: string;

  @OneToOne(() => Person, person => person.pharmacien)
  person: Person;
}
