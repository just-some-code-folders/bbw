// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Module } from '@nestjs/common';
import { GovernmentsService } from './governments.service';
import { GovernmentsController } from './governments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsExist } from '../utils/validators/is-exists.validator';
import { IsNotExist } from '../utils/validators/is-not-exists.validator';
import { Government } from './entities/governments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Government])],
  controllers: [GovernmentsController],
  providers: [IsExist, IsNotExist, GovernmentsService],
  exports: [GovernmentsService],
})
export class GovernmentsModule {}
