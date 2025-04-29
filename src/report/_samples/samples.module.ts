import { Module } from '@nestjs/common';
import { SamplesService } from './samples.service';
import { SamplesController } from './samples.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sample } from './entities/samples.entity';
import { IsExist } from '../../utils/validators/is-exists.validator';
import { IsNotExist } from '../../utils/validators/is-not-exists.validator';
import { SharedModule } from 'src/_shared/shared.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([Sample]),
  ],
  controllers: [SamplesController],
  providers: [IsExist, IsNotExist, SamplesService],
  exports: [SamplesService],
})
export class SamplesModule { }
