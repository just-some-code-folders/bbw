import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Report } from '../../report/entities/reports.entity';
import { Sample } from '../_samples/entities/samples.entity';

@Entity()
export class ReportSample {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('int') // assuming quantity is an integer
    quantity: number;

    @ManyToOne(() => Report, report => report.reportSamples, { onDelete: 'CASCADE' })
    report: Report;

    @ManyToOne(() => Sample, sample => sample.reportSamples, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sampleId' }) // Explicitly define the foreign key column
    sample: Sample;

    @Column({ nullable: true }) // Add a column to expose the `sampleId` directly
    sampleId: number;
}
