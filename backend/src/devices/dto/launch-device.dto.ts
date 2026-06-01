import { IsString } from 'class-validator';

export class LaunchDeviceDto {
  @IsString()
  deviceId!: string;

  @IsString()
  module!: string;
}