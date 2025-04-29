import { PartialType } from '@nestjs/swagger';
import { CreateDelegateDto } from './create-delegate.dto';

export class UpdateDelegateDto extends PartialType(CreateDelegateDto) {}
