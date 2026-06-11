import { IsString } from 'class-validator';

export class UpdateDeviceNameDto {
  @IsString()
  friendlyName!: string;
}