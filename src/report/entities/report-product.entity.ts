import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Report } from '../../report/entities/reports.entity';
import { Product } from '../_products/entities/products.entity';

@Entity()
export class ReportProduct {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    potential: string;

    @ManyToOne(() => Report, report => report.reportProducts, { onDelete: 'CASCADE' })
    report: Report;

    @ManyToOne(() => Product, product => product.reportProducts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column({ nullable: true })
    productId: number;
}
