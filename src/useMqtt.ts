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
  const [client, setClient] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({ suhu: 0, kelembaban: 0 });
  const [relayStatus, setRelayStatus] = useState<RelayStatus>({ r1: 0, r2: 0, r3: 0, r4: 0, v1: 0, v2: 0 });

  useEffect(() => {
    if (!deviceId) return;

    // Use Secure WebSockets (wss://) to connect from a web browser
    const mqttUrl = 'wss://broker.emqx.io:8084/mqtt';
    const clientId = `web-client-${Math.random().toString(16).slice(2, 8)}`;
    console.log(`Attempting MQTT connection to: ${mqttUrl} with clientId: ${clientId}`);
    
    const mqttClient = mqtt.connect(mqttUrl, {
      clientId,
      keepalive: 30,
      reconnectPeriod: 5000,
      protocolVersion: 4,
    });

    setClient(mqttClient);

    mqttClient.on('connect', () => {
      console.log('✅ MQTT Connected Successfully!');
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
      console.error('MQTT connection error details:', err.message, err);
      // Don't call mqttClient.end() here, let it reconnect automatically
    });

    mqttClient.on('disconnect', (packet) => {
      console.warn('MQTT client disconnected:', packet);
    });

    mqttClient.on('offline', () => {
      console.warn('MQTT client went offline');
    });

    mqttClient.on('reconnect', () => {
      console.log('MQTT client reconnecting...');
    });

    mqttClient.on('close', () => {
      console.log('MQTT connection closed');
      setConnected(false);
    });

    return () => {
      mqttClient.end();
    };
  }, [deviceId]);

  const sendCommand = useCallback((cmd: string) => {
    if (client && deviceId) {
      console.log(`Sending command: ${cmd} to smartlight/${deviceId}/cmd`);
      client.publish(`smartlight/${deviceId}/cmd`, cmd);
    } else {
      console.warn("MQTT client not available to send command:", cmd);
    }
  }, [client, deviceId]);

  return { connected, sensorData, relayStatus, setRelayStatus, sendCommand };
}
