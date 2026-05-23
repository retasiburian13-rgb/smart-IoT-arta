import mqtt from 'mqtt';
import { useEffect, useState, useCallback } from 'react';

export interface EventLog {
  time: string;
  message: string;
  type: 'info' | 'sent' | 'received' | 'error';
}

export function useMqtt(deviceId: string) {
  const [client, setClient] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({ suhu: 0, kelembaban: 0 });
  const [relayStatus, setRelayStatus] = useState<RelayStatus>({ r1: 0, r2: 0, r3: 0, r4: 0, v1: 0, v2: 0 });
  const [logs, setLogs] = useState<EventLog[]>([]);

  const addLog = useCallback((message: string, type: EventLog['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [{ time, message, type }, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  useEffect(() => {
    if (!deviceId) return;

    const mqttUrl = 'wss://broker.emqx.io:8084/mqtt';
    const clientId = `web-client-${Math.random().toString(16).slice(2, 8)}`;
    console.log(`Attempting MQTT connection to: ${mqttUrl} with clientId: ${clientId}`);
    addLog(`Connecting to ${mqttUrl}...`, 'info');
    
    const mqttClient = mqtt.connect(mqttUrl, {
      clientId,
      keepalive: 30,
      reconnectPeriod: 5000,
      protocolVersion: 4,
    });

    setClient(mqttClient);

    mqttClient.on('connect', () => {
      console.log('✅ MQTT Connected Successfully!');
      addLog('MQTT Connected successfully!', 'info');
      setConnected(true);
      const baseTopic = `smartlight/${deviceId}`;
      
      mqttClient.subscribe(`${baseTopic}/status`);
      mqttClient.subscribe(`${baseTopic}/sensor`);
      addLog(`Subscribed to ${baseTopic}/#`, 'info');
      
      mqttClient.publish(`${baseTopic}/cmd`, 'get_status');
      mqttClient.publish(`${baseTopic}/cmd`, 'get_sensor');
    });

    mqttClient.on('message', (topic, message) => {
      const baseTopic = `smartlight/${deviceId}`;
      try {
        const payloadStr = message.toString();
        const payload = JSON.parse(payloadStr);
        if (topic === `${baseTopic}/status`) {
          setRelayStatus(payload);
          addLog(`Status updated: ${payloadStr}`, 'received');
        } else if (topic === `${baseTopic}/sensor`) {
          setSensorData(payload);
          addLog(`Sensor updated: ${payloadStr}`, 'received');
        }
      } catch (e) {
        addLog(`Invalid message on ${topic}`, 'error');
      }
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT connection error details:', err.message, err);
      addLog(`Connection error: ${err.message}`, 'error');
    });

    mqttClient.on('disconnect', (packet) => {
      addLog('MQTT disconnected', 'error');
    });

    mqttClient.on('offline', () => {
      addLog('MQTT currently offline', 'error');
    });

    mqttClient.on('reconnect', () => {
      addLog('Reconnecting to broker...', 'info');
    });

    mqttClient.on('close', () => {
      setConnected(false);
    });

    return () => {
      mqttClient.end();
    };
  }, [deviceId, addLog]);

  const sendCommand = useCallback((cmd: string) => {
    if (client && deviceId) {
      const topic = `smartlight/${deviceId}/cmd`;
      addLog(`Sent cmd: ${cmd}`, 'sent');
      client.publish(topic, cmd, { qos: 0 }, (error: any) => {
        if(error) addLog(`Failed to send cmd: ${cmd}`, 'error');
      });
    } else {
      addLog(`Client not ready for cmd: ${cmd}`, 'error');
    }
  }, [client, deviceId, addLog]);

  return { connected, sensorData, relayStatus, setRelayStatus, sendCommand, logs };
}
