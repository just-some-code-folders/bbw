import { PartialType } from '@nestjs/swagger';
import { CreateGovernmentDto } from './create-government.dto';

export class FilterGovernmentDto extends PartialType(CreateGovernmentDto) {}
