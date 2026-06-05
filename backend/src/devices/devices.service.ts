import { Injectable } from '@nestjs/common';

import { AppGateway } from '../gateway/app.gateway';
import { DevicePersistenceService } from '../device-persistence/device-persistence.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(
    private readonly gateway: AppGateway,
    private readonly devicePersistenceService: DevicePersistenceService,
    private readonly prisma: PrismaService,
  ) {}

  async getDevices() {
    return this.devicePersistenceService.getDevices();
  }

  async getAllDevices() {
    return this.devicePersistenceService.getAllDevices();
  }

  async launchDevice(
    deviceId: string,
    module: string,
  ) {
    this.gateway.sendLaunchCommand(
      deviceId,
      module,
    );

    await this.prisma.launchLog.create({
      data: {
        deviceId,
        module,
        status: 'SUCCESS',
      },
    });

    return {
      success: true,
      deviceId,
      module,
      message:
        'Launch command sent successfully',
    };
  }

  getOnlineDevices() {
    return this.gateway
      .getConnectedDevices()
      .map((deviceId) => ({
        deviceId,
        status: 'ONLINE',
      }));
  }

  async launchMultipleDevices(
    deviceIds: string[],
    module: string,
  ) {
    this.gateway
      .sendLaunchCommandToMultiple(
        deviceIds,
        module,
      );

    return {
      success: true,
      deviceIds,
      module,
      message:
        'Launch command sent successfully',
    };
  }

  async launchAllDevices(
    module: string,
  ) {
    this.gateway.sendLaunchCommandToAll(
      module,
    );

    return {
      success: true,
      module,
      message:
        'Launch command sent to all devices',
    };
  }

  async getLaunchLogs() {
    return this.prisma.launchLog.findMany({
      orderBy: {
        launchedAt: 'desc',
      },
    });
  }

  async updateFriendlyName(
    deviceId: string,
    friendlyName: string,
  ) {
    return this.devicePersistenceService
      .updateFriendlyName(
        deviceId,
        friendlyName,
      );
  }
}