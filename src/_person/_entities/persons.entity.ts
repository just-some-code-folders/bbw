// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { Doctor } from '../doctor/_entities/doctors.entity';
import { Pharmacien } from '../pharmacy/entities/pharmaciens.entity';
import { Wholesaler } from '../wholesaler/entities/wholesalers.entity';
import { Delegate } from '../../_delegate/entities/delegates.entity';
import { Government } from '../../_government/entities/governments.entity';
import { Region } from '../../_government/region/entities/regions.entity';
import { Report } from 'src/report/entities/reports.entity';

@Entity()
export class Person extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  address: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  potential: string;

  @Column({ nullable: true })
  type: number;

  @OneToOne(() => Doctor, doctor => doctor.person, { nullable: true, cascade: true })
  @JoinColumn()
  doctor: Doctor;

  @OneToOne(() => Pharmacien, pharmacien => pharmacien.person, { nullable: true, cascade: true })
  @JoinColumn()
  pharmacien: Pharmacien;

  @OneToOne(() => Wholesaler, wholesaler => wholesaler.person, { nullable: true, cascade: true })
  @JoinColumn()
  wholesaler: Wholesaler;

  @ManyToMany(() => Delegate, delegate => delegate.persons, { cascade: true })
  @JoinTable() // This creates a join table to manage the many-to-many relationship
  delegates: Delegate[];

  @ManyToOne(() => Government, government => government.persons, { nullable: true, cascade: true, eager: true })
  @JoinColumn()
  government: Government;

  @ManyToOne(() => Region, region => region.persons, { nullable: true, cascade: true, eager: true })
  @JoinColumn()
  region: Region;

  @OneToMany(() => Report, report => report.person)
  reports: Report[];
}
