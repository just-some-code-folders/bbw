import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptions } from '../utils/types/find-options.type';
import { DeepPartial, Not, Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { NullableType } from '../utils/types/nullable.type';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async findOne(options: FindOptions<Session>): Promise<NullableType<Session>> {
    return this.sessionRepository.findOne({
      where: options.where,
    });
  }

  async findMany(options: FindOptions<Session>): Promise<Session[]> {
    return this.sessionRepository.find({
      where: options.where,
    });
  }

  async create(data: DeepPartial<Session>): Promise<Session> {
    return this.sessionRepository.save(this.sessionRepository.create(data));
  }

  async delete({
    excludeId,
    ...criteria
  }: {
    id?: Session['id'];
    user?: Pick<User, 'id'>;
    excludeId?: Session['id'];
  }): Promise<void> {
    await this.sessionRepository.delete({
      ...criteria,
      id: criteria.id ? criteria.id : excludeId ? Not(excludeId) : undefined,
    });
  }
}
