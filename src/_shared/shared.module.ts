import { Module } from '@nestjs/common';
import { ImportGateway } from '../socket/import.gateway';

@Module({
  providers: [ImportGateway],
  exports: [ImportGateway],
})
export class SharedModule {}
