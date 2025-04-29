import { ApiProperty } from '@nestjs/swagger';

export class RegionDto {
  @ApiProperty({ type: Number, description: 'ID of the region' })
  id: number;

  @ApiProperty({ type: String, description: 'Name of the region' })
  name: string;

  @ApiProperty({ type: Number, description: 'ID of the government' })
  governmentId: number;
}
