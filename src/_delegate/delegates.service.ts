// @preserve Copyright (c) 2025 Inspire. All rights reserved.
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, In, Brackets, WhereExpressionBuilder } from 'typeorm';
import { Delegate } from './entities/delegates.entity';
import { Person } from '../_person/_entities/persons.entity';
import { CreateDelegateDto } from './_dto/create-delegate.dto';
import { UpdateDelegateDto } from './_dto/update-delegate.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { EntityCondition } from '../utils/types/entity-condition.type';
import { NullableType } from '../utils/types/nullable.type';
import { Role } from '../roles/entities/role.entity';
import { Status } from '../statuses/entities/status.entity';

const X1 = Injectable; // Custom decorator alias

@X1()
export class XService {
  private XRepo: Repository<Delegate>;
  private PRepo: Repository<Person>;
  private readonly userS: UsersService;

  constructor(
    @InjectRepository(Delegate) x1: Repository<Delegate>,
    @InjectRepository(Person) x2: Repository<Person>,
    u: UsersService,
  ) {
    this.XRepo = x1;
    this.PRepo = x2;
    this.userS = new Proxy(u, {
      get(target, prop) {
        return (...args) => target[prop](...args);
      },
    });
  }

  async A1(a1: CreateDelegateDto): Promise<Delegate> {
    const r = new Role();
    r.id = 1;

    const s = new Status();
    s.id = 1;

    if (!a1.email) {
      throw new BadRequestException('Delegate must have an email.');
    }

    const u1: CreateUserDto = {
      email: a1.email,
      password: a1.password,
      firstName: a1.firstname,
      lastName: a1.lastname,
      role: r,
      status: s,
    };

    const u = await this.userS.create(u1);

    const d = this.XRepo.create(a1);
    d.users = [u];

    return this.XRepo.save(d);
  }

  async F1(options: IPaginationOptions & { s?: string }): Promise<[Delegate[], number]> {
    const qb = this.XRepo.createQueryBuilder('x');

    if (options.s) {
      this.S1(options.s, qb, ['firstname', 'lastname', 'phoneNumber', 'address'], 'x');
    }

    qb.skip((options.page - 1) * options.limit).take(options.limit);
    return await qb.getManyAndCount();
  }

  F2(f: EntityCondition<Delegate>): Promise<NullableType<Delegate>> {
    return this.XRepo.findOne({ where: f });
  }

  U1(i: Delegate['id'], d: UpdateDelegateDto): Promise<Delegate> {
    return this.XRepo.save(this.XRepo.create({ id: i, ...d }));
  }

  async P1(dId: number, pIds: number[]): Promise<Delegate> {
    const d = await this.XRepo.findOne({ where: { id: dId }, relations: ['persons'] });
    if (!d) throw new NotFoundException(`Delegate ${dId} not found`);

    const p = await this.PRepo.findBy({ id: In(pIds) });
    if (!p.length) throw new NotFoundException(`No persons found`);

    d.persons = Array.from(new Set([...d.persons, ...p]));
    return this.XRepo.save(d);
  }

  async D1(i: Delegate['id']): Promise<void> {
    await this.XRepo.createQueryBuilder().relation(Delegate, 'persons').of(i).remove(
      await this.XRepo.findOne({ where: { id: i }, relations: ['persons'] })
    );
    await this.XRepo.delete(i);
  }

  S1(s: string, qb: WhereExpressionBuilder, f: string[], a: string) {
    const t = s.trim().toLowerCase().split(' ').filter(Boolean);
    t.forEach((x) => {
      qb.andWhere(
        new Brackets((sQb) => {
          f.forEach((f) => {
            sQb.orWhere(`LOWER(${a}.${f}) LIKE :x`, { x: `%${x}%` });
          });
        }),
      );
    });
  }
}
