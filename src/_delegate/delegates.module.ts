// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Module } from '@nestjs/common';
import { XService } from './delegates.service';
import { XController } from './delegates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsExist } from '../utils/validators/is-exists.validator';
import { IsNotExist } from '../utils/validators/is-not-exists.validator';
import { PersonsService } from '../_person/persons.service';
import { Delegate } from './entities/delegates.entity';
import { Person } from '../_person/_entities/persons.entity';
import { Role } from '../roles/entities/role.entity';
import { Status } from '../statuses/entities/status.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Region } from 'src/_government/region/entities/regions.entity';
import { Government } from 'src/_government/entities/governments.entity';
import { Specialty } from 'src/_person/doctor/specialty/entities/specialties.entity';
import { SharedModule } from '../_shared/shared.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Delegate]),
        TypeOrmModule.forFeature([Person]),
        TypeOrmModule.forFeature([Specialty]),
        TypeOrmModule.forFeature([Role]),
        TypeOrmModule.forFeature([Status]),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Region]),
        TypeOrmModule.forFeature([Government]),
        SharedModule,
    ],
    controllers: [XController],
    providers: [IsExist, IsNotExist, XService, PersonsService, UsersService],
    exports: [XService],
})
export class DelegatesModule { }
