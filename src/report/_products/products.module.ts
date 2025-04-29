import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/products.entity';
import { IsExist } from '../../utils/validators/is-exists.validator';
import { IsNotExist } from '../../utils/validators/is-not-exists.validator';
import { SharedModule } from 'src/_shared/shared.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [IsExist, IsNotExist, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }
