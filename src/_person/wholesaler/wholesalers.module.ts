// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Module } from '@nestjs/common';
import { WholesalersService } from './wholesalers.service';
import { WholesalersController } from './wholesalers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsExist } from '../../utils/validators/is-exists.validator';
import { IsNotExist } from '../../utils/validators/is-not-exists.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Wholesaler])],
  controllers: [WholesalersController],
  providers: [IsExist, IsNotExist, WholesalersService],
  exports: [WholesalersService],
})
export class Wholesaler {}
