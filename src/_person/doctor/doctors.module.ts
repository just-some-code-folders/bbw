// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsExist } from '../../utils/validators/is-exists.validator';
import { IsNotExist } from '../../utils/validators/is-not-exists.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor])],
  controllers: [DoctorsController],
  providers: [IsExist, IsNotExist, DoctorsService],
  exports: [DoctorsService],
})
export class Doctor {}
