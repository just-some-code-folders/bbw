// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Module } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { PersonsController } from './persons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsExist } from '../utils/validators/is-exists.validator';
import { IsNotExist } from '../utils/validators/is-not-exists.validator';
import { Person } from './_entities/persons.entity';
import { Delegate } from '../_delegate/entities/delegates.entity';
import { Government } from 'src/_government/entities/governments.entity';
import { Region } from 'src/_government/region/entities/regions.entity';
import { Specialty } from './doctor/specialty/entities/specialties.entity';
import { SharedModule } from '../_shared/shared.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([Person]),
    TypeOrmModule.forFeature([Specialty]),
    TypeOrmModule.forFeature([Delegate]),
    TypeOrmModule.forFeature([Government]),
    TypeOrmModule.forFeature([Region]),
  ],
  controllers: [PersonsController],
  providers: [IsExist, IsNotExist, PersonsService],
  exports: [PersonsService],
})
export class PersonsModule { }
