import {
  IsArray,
  IsString,
  ArrayNotEmpty,
} from 'class-validator';

export class LaunchMultipleDevicesDto {
  @IsArray()
  @ArrayNotEmpty()
  deviceId!: string[];

  @IsString()
  module!: string;
}