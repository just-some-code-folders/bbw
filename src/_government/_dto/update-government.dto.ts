import { PartialType } from '@nestjs/swagger';
import { CreateGovernmentDto } from './create-government.dto';

export class UpdateGovernmentDto extends PartialType(CreateGovernmentDto) {}
