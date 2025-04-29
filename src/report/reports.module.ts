import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/reports.entity';
import { IsExist } from '../utils/validators/is-exists.validator';
import { IsNotExist } from '../utils/validators/is-not-exists.validator';
import { Government } from 'src/_government/entities/governments.entity';
import { Region } from 'src/_government/region/entities/regions.entity';
import { Person } from 'src/_person/_entities/persons.entity';
import { Product } from './_products/entities/products.entity';
import { Sample } from './_samples/entities/samples.entity';
import { Delegate } from 'src/_delegate/entities/delegates.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    TypeOrmModule.forFeature([Government]),
    TypeOrmModule.forFeature([Region]),
    TypeOrmModule.forFeature([Person]),
    TypeOrmModule.forFeature([Product]),
    TypeOrmModule.forFeature([Sample]),
    TypeOrmModule.forFeature([Delegate]),
  ],
  controllers: [ReportsController],
  providers: [IsExist, IsNotExist, ReportsService],
  exports: [ReportsService],
})
export class ReportsModule { }
