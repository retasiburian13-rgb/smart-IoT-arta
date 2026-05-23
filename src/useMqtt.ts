import mqtt from 'mqtt';
import { useEffect, useState, useCallback } from 'react';

export interface SensorData {
  suhu: number;
  kelembaban: number;
}

export interface RelayStatus {
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  v1: number;
  v2: number;
}

export function useMqtt(deviceId: string) {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({ suhu: 0, kelembaban: 0 });
  const [relayStatus, setRelayStatus] = useState<RelayStatus>({ r1: 0, r2: 0, r3: 0, r4: 0, v1: 0, v2: 0 });

  useEffect(() => {
    if (!deviceId) return;

    // Use Secure WebSockets (wss://) to connect from a web browser
    const mqttUrl = 'wss://broker.emqx.io:8084/mqtt';
    const mqttClient = mqtt.connect(mqttUrl, {
      clientId: `web-client-${Math.random().toString(16).slice(2, 8)}`,
      keepalive: 30,
    });

    setClient(mqttClient);

    mqttClient.on('connect', () => {
      setConnected(true);
      const baseTopic = `smartlight/${deviceId}`;
      // Subscribe to both topics that the ESP32 publishes to
      mqttClient.subscribe(`${baseTopic}/status`);
      mqttClient.subscribe(`${baseTopic}/sensor`);
      
      // Request initial status and sensor data immediately after connecting
      mqttClient.publish(`${baseTopic}/cmd`, 'get_status');
      mqttClient.publish(`${baseTopic}/cmd`, 'get_sensor');
    });

    mqttClient.on('message', (topic, message) => {
      const baseTopic = `smartlight/${deviceId}`;
      try {
        const payload = JSON.parse(message.toString());
        if (topic === `${baseTopic}/status`) {
          setRelayStatus(payload);
        } else if (topic === `${baseTopic}/sensor`) {
          setSensorData(payload);
        }
      } catch (e) {
        console.error("Invalid JSON from MQTT on topic", topic, ":", message.toString());
      }
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT connection error:', err);
      mqttClient.end();
    });

    mqttClient.on('close', () => {
      setConnected(false);
    });

    return () => {
      mqttClient.end();
    };
  }, [deviceId]);

  const sendCommand = useCallback((cmd: string) => {
    if (client && connected && deviceId) {
      client.publish(`smartlight/${deviceId}/cmd`, cmd);
    }
  }, [client, connected, deviceId]);

  return { connected, sensorData, relayStatus, sendCommand };
}
