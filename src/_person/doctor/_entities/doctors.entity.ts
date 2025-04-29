// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import { Person } from '../../../_person/_entities/persons.entity';
import { Specialty } from '../specialty/entities/specialties.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Doctor extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  doctorType: number;

  @ManyToOne(() => Specialty, specialty => specialty.doctor, { eager: true, nullable: true })
  @JoinColumn()
  @ApiProperty({ example: 1, description: 'ID of the specialty' })
  specialty: Specialty;

  @OneToOne(() => Person, person => person.doctor)
  person: Person;
}
