// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specialty } from './entities/specialties.entity';
import { SpecialtysController } from './specialties.controller';
import { IsNotExist } from '../../../utils/validators/is-not-exists.validator';
import { SpecialtysService } from './specialties.service';
import { IsExist } from '../../../utils/validators/is-exists.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Specialty])],
  controllers: [SpecialtysController],
  providers: [IsExist, IsNotExist, SpecialtysService],
  exports: [SpecialtysService],
})
export class SpecialtysModule {}
