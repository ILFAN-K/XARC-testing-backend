import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';

import { DevicesService } from './devices.service';
import { LaunchDeviceDto } from './dto/launch-device.dto';
import { LaunchMultipleDevicesDto } from './dto/launch-multiple-devices.dto';
import { Patch, Param } from '@nestjs/common';
import { UpdateDeviceNameDto } from './dto/update-device-name.dto';

@Controller('devices')
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
  ) {}

  @Get()
  getDevices() {
    return this.devicesService.getDevices();
  }

  @Get('online')
  getOnlineDevices() {
    return this.devicesService.getOnlineDevices();
  }

  @Get('db')
  getAllDevices() {
    return this.devicesService.getAllDevices();
  }

  @Get('launch-logs')
  getLaunchLogs() {
    return this.devicesService.getLaunchLogs();
  }

  @Patch(':deviceId/name')
  updateFriendlyName(
    @Param('deviceId')
    deviceId: string,

    @Body()
    dto: UpdateDeviceNameDto,
  ) {
    return this.devicesService
      .updateFriendlyName(
        deviceId,
        dto.friendlyName,
      );
  }

  @Post('launch')
  launch(
    @Body() dto: LaunchDeviceDto,
  ) {
    return this.devicesService.launchDevice(
      dto.deviceId,
      dto.module,
    );
  }

  @Post('launch-multiple')
  launchMultiple(
    @Body()
    dto: LaunchMultipleDevicesDto,
  ) {
    return this.devicesService
      .launchMultipleDevices(
        dto.deviceId,
        dto.module,
      );
  }

  @Post('launch-all')
launchAll(
  @Body() body: {
    module: string;
  },
) {
  return this.devicesService
    .launchAllDevices(
      body.module,
    );
}
}