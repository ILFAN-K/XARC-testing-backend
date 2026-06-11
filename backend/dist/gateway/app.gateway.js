"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let AppGateway = class AppGateway {
    constructor() {
        this.connectedDevices = new Map();
    }
    afterInit(server) {
        console.log('WebSocket Gateway initialized');
    }
    handleConnection(client) {
        console.log(`Agent Connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Agent Disconnected: ${client.id}`);
        for (const [deviceId, socketId,] of this.connectedDevices.entries()) {
            if (socketId === client.id) {
                this.connectedDevices.delete(deviceId);
                console.log(`Removed device: ${deviceId}`);
                break;
            }
        }
    }
    handleRegisterDevice(client, payload) {
        const deviceId = payload.DeviceId;
        const machineName = payload.MachineName;
        this.connectedDevices.set(deviceId, client.id);
        console.log(`Registered Device: ${deviceId}`);
        console.log(`Machine Name: ${machineName}`);
        console.log('Connected Devices:');
        console.log(this.connectedDevices);
        return {
            success: true,
        };
    }
    sendLaunchCommand(deviceId, module) {
        const socketId = this.connectedDevices.get(deviceId);
        if (!socketId) {
            throw new Error(`Device ${deviceId} is offline`);
        }
        this.server
            .to(socketId)
            .emit('launch-module', {
            module,
        });
        console.log(`Launch command sent to ${deviceId}`);
    }
    getConnectedDevices() {
        return Array.from(this.connectedDevices.keys());
    }
};
exports.AppGateway = AppGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('register-device'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "handleRegisterDevice", null);
exports.AppGateway = AppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], AppGateway);
//# sourceMappingURL=app.gateway.js.map