import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { Person } from '../../_person/_entities/persons.entity';
import { Region } from '../../_government/region/entities/regions.entity';
import { Government } from '../../_government/entities/governments.entity';
import { Sample } from '../_samples/entities/samples.entity';
import { ReportSample } from './report-sample.entity';
import { ReportProduct } from './report-product.entity';
import { Product } from '../_products/entities/products.entity';
import { Delegate } from 'src/_delegate/entities/delegates.entity';

@Entity()
export class Report extends EntityHelper {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    date: string;

    @Column()
    duration: string;

    @Column()
    specialty: string;

    @Column()
    note: string;

    @Column()
    status: string;

    @OneToMany(() => Sample, samples => samples.report)
    samples: Sample[];

    @OneToMany(() => Product, products => products.report)
    products: Product[];

    @ManyToOne(() => Person, person => person.reports, { nullable: true, cascade: true, eager: true })
    @JoinColumn()
    person: Person;

    @ManyToOne(() => Delegate, delegate => delegate.reports, { nullable: true, cascade: true, eager: true })
    @JoinColumn()
    delegate: Delegate;

    @ManyToOne(() => Government, government => government.reports, { nullable: true, cascade: true, eager: true })
    @JoinColumn()
    government: Government;

    @ManyToOne(() => Region, region => region.reports, { nullable: true, cascade: true, eager: true })
    @JoinColumn()
    region: Region;

    @OneToMany(() => ReportSample, reportSample => reportSample.report, { cascade: true })
    reportSamples: ReportSample[];

    @OneToMany(() => ReportProduct, reportProduct => reportProduct.report, { cascade: true })
    reportProducts: ReportProduct[];
}
