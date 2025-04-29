import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import { Report } from '../../../report/entities/reports.entity';
import { ReportProduct } from '../../../report/entities/report-product.entity';

@Entity()
export class Product extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, type: 'float', default: 0 })
  price: number;

  @Column({ nullable: true })
  family: string;

  @Column({ nullable: true })
  productCreationDate: string;

  @Column({ nullable: true, unique: true })
  productCode: string;

  @Column({ nullable: true, unique: true })
  barCode: string;

  @ManyToOne(() => Report, report => report.products)
  report: Report;

  @OneToMany(() => ReportProduct, reportProduct => reportProduct.product, { cascade: true })
  reportProducts: ReportProduct[];
}
