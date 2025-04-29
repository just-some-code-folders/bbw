import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import { Report } from '../../../report/entities/reports.entity';
import { ReportSample } from '../../../report/entities/report-sample.entity';

@Entity()
export class Sample extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, unique: true })
  sampleCode: string;

  @ManyToOne(() => Report, report => report.samples)
  report: Report;

  @OneToMany(() => ReportSample, reportSample => reportSample.sample, { cascade: true })
  reportSamples: ReportSample[];
}
