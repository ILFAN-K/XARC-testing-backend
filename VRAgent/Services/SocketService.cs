using SocketIOClient;
using System.Diagnostics;

namespace VRAgent.Services;

public class SocketService
{
    private SocketIO? _socket;

    private readonly DeviceIdService _deviceIdService;

    private readonly string _deviceId;

    public SocketIO? Socket => _socket;

    public SocketService(
        DeviceIdService deviceIdService)
    {
        _deviceIdService =
            deviceIdService;

        _deviceId =
            _deviceIdService.GetDeviceId();
    }

    public async Task ConnectAsync(
        string serverUrl)
    {
        _socket = new SocketIO(
            new Uri(serverUrl)
        );

        _socket.OnConnected += async (_, _) =>
        {
            Console.WriteLine(
                "Connected to NestJS"
            );

            Console.WriteLine(
                $"Device ID: {_deviceId}"
            );

            await EmitAsync(
                "register-device",
                new
                {
                    DeviceId = _deviceId,
                    MachineName =
                        Environment.MachineName
                }
            );

            _ = StartHeartbeatAsync();
        };

        _socket.OnDisconnected += (_, _) =>
        {
            Console.WriteLine(
                "Disconnected from NestJS"
            );
        };

        await _socket.ConnectAsync();

        _socket.On(
            "launch-module",
            async response =>
            {
                Console.WriteLine(
                    "================================="
                );

                Console.WriteLine(
                    "Launch command received!"
                );

                try
                {
                    Process.Start(
                        new ProcessStartInfo
                        {
                            FileName =
                                "notepad.exe",
                            UseShellExecute =
                                true
                        }
                    );

                    Console.WriteLine(
                        "Notepad launched successfully."
                    );
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"Launch failed: {ex.Message}"
                    );
                }

                Console.WriteLine(
                    "================================="
                );

                await Task.CompletedTask;
            });
    }

    private async Task StartHeartbeatAsync()
    {
        while (_socket != null
            && _socket.Connected)
        {
            try
            {
                await EmitAsync(
                    "heartbeat",
                    new
                    {
                        DeviceId =
                            _deviceId
                    }
                );

                Console.WriteLine(
                    $"Heartbeat sent from {_deviceId}"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Heartbeat failed: {ex.Message}"
                );
            }

            await Task.Delay(
                TimeSpan.FromSeconds(30)
            );
        }
    }

    public async Task EmitAsync(
        string eventName,
        object data)
    {
        if (_socket == null)
        {
            Console.WriteLine(
                "Socket is not connected."
            );

            return;
        }

        await _socket.EmitAsync(
            eventName,
            new object[] { data }
        );
    }
}