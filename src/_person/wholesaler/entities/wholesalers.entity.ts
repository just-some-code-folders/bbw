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
  export class Wholesaler extends EntityHelper {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    @ApiProperty({ example: 'Bla Bla company' })
    companyName: string;
  
    @OneToOne(() => Person, person => person.wholesaler)
    person: Person;
  }
  