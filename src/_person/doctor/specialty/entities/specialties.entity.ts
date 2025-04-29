// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from '../../_entities/doctors.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../../../utils/entity-helper';

@Entity()
export class Specialty extends EntityHelper {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: () => Number, description: 'id of specialty', example: 1 })
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  abreviation: string;

  @OneToMany(() => Doctor, doctor => doctor.specialty)
  doctor: Doctor[];
}
