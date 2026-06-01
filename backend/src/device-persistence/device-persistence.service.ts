import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DevicePersistenceService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async registerOrUpdateDevice(
    deviceId: string,
    machineName: string,
  ) {
    const existingDevice =
      await this.prisma.device.findUnique({
        where: {
          deviceId,
        },
      });

    if (existingDevice) {
      return this.prisma.device.update({
        where: {
          deviceId,
        },
        data: {
          machineName,
          status: 'ONLINE',
          lastSeen: new Date(),
        },
      });
    }

    const organization =
      await this.prisma.organization.findFirst();

    if (!organization) {
      throw new Error(
        'No organization found.',
      );
    }

    return this.prisma.device.create({
      data: {
        deviceId,
        machineName,
        status: 'ONLINE',
        lastSeen: new Date(),
        organizationId:
          organization.id,
      },
    });
  }

  async markDeviceOffline(
    deviceId: string,
  ) {
    return this.prisma.device.updateMany({
      where: {
        deviceId,
      },
      data: {
        status: 'OFFLINE',
      },
    });
  }

  async updateHeartbeat(
    deviceId: string,
  ) {
    return this.prisma.device.updateMany({
      where: {
        deviceId,
      },
      data: {
        lastSeen: new Date(),
        status: 'ONLINE',
      },
    });
  }

  async getAllDevices() {
    return this.prisma.device.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDevices() {
    return this.prisma.device.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}