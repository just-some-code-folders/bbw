// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Module } from '@nestjs/common';
import { PharmaciensService } from './pharmaciens.service';
import { PharmaciensController } from './pharmaciens.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsExist } from '../../utils/validators/is-exists.validator';
import { IsNotExist } from '../../utils/validators/is-not-exists.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Pharmacien])],
  controllers: [PharmaciensController],
  providers: [IsExist, IsNotExist, PharmaciensService],
  exports: [PharmaciensService],
})
export class Pharmacien {}
