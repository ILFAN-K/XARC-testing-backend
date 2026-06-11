import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { DevicePersistenceService } from '../device-persistence/device-persistence.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
{
  constructor(
    private readonly devicePersistenceService: DevicePersistenceService,
  ) {}

  @WebSocketServer()
  server!: Server;

  private connectedDevices =
    new Map<string, string>();

  afterInit(server: Server) {
    console.log(
      'WebSocket Gateway initialized',
    );
  }

  handleConnection(client: Socket) {
    console.log(
      `Agent Connected: ${client.id}`,
    );
  }

  async handleDisconnect(
    client: Socket,
  ) {
    console.log(
      `Agent Disconnected: ${client.id}`,
    );

    for (const [
      deviceId,
      socketId,
    ] of this.connectedDevices.entries()) {
      if (socketId === client.id) {
        await this.devicePersistenceService
          .markDeviceOffline(
            deviceId,
          );

        this.connectedDevices.delete(
          deviceId,
        );

        console.log(
          `Removed device: ${deviceId}`,
        );

        break;
      }
    }
  }

  @SubscribeMessage('register-device')
  async handleRegisterDevice(
    client: Socket,
    payload: any,
  ) {
    const deviceId =
      payload.DeviceId;

    const machineName =
      payload.MachineName;

    this.connectedDevices.set(
      deviceId,
      client.id,
    );

    await this.devicePersistenceService
      .registerOrUpdateDevice(
        deviceId,
        machineName,
      );

    console.log(
      `Registered Device: ${deviceId}`,
    );

    console.log(
      `Machine Name: ${machineName}`,
    );

    console.log(
      'Connected Devices:',
    );

    console.log(
      this.connectedDevices,
    );

    return {
      success: true,
    };
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(
    client: Socket,
    payload: any,
  ) {
    await this.devicePersistenceService
      .updateHeartbeat(
        payload.DeviceId,
      );

    console.log(
      `Heartbeat received from ${payload.DeviceId}`,
    );

    return {
      success: true,
    };
  }

  public sendLaunchCommand(
    deviceId: string,
    module: string,
  ) {
    const socketId =
      this.connectedDevices.get(
        deviceId,
      );

    if (!socketId) {
      throw new Error(
        `Device ${deviceId} is offline`,
      );
    }

    this.server
      .to(socketId)
      .emit(
        'launch-module',
        {
          module,
        },
      );

    console.log(
      `Launch command sent to ${deviceId}`,
    );
  }

  public sendLaunchCommandToAll(module: string) {
    this.server.emit(
      'launch-module',
      {
        module,
      },
    );

  console.log(
    `Launch command sent to all devices`,
  );
}

public sendLaunchCommandToMultiple(
  deviceIds: string[],
  module: string,
) {
  for (const deviceId of deviceIds) {
    const socketId =
      this.connectedDevices.get(
        deviceId,
      );

    if (!socketId) {
      console.log(
        `Device ${deviceId} is offline`,
      );
      continue;
    }

    this.server
      .to(socketId)
      .emit(
        'launch-module',
        {
          module,
        },
      );

    console.log(
      `Launch command sent to ${deviceId}`,
    );
  }
}

  public getConnectedDevices() {
    return Array.from(
      this.connectedDevices.keys(),
    );
  }
}