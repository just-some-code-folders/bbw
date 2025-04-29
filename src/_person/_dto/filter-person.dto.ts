import { PartialType } from '@nestjs/swagger';
import { CreatePersonDto } from './create-person.dto';

export class FilterPersonDto extends PartialType(CreatePersonDto) {}
