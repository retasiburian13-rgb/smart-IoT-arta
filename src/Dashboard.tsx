import React, { useState } from 'react';
import { useMqtt } from './useMqtt';
import { Power, Thermometer, Droplets, Zap, Layers, Square, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [deviceId, setDeviceId] = useState('demo');
  const [activeDeviceId, setActiveDeviceId] = useState('demo');
  
  const { connected, sensorData, relayStatus, setRelayStatus, sendCommand, logs } = useMqtt(activeDeviceId);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (deviceId.trim()) {
      setActiveDeviceId(deviceId.trim());
    }
  };

  const getRelayIsOn = (index: number) => {
    switch(index) {
      case 1: return relayStatus.r1 === 1;
      case 2: return relayStatus.r2 === 1;
      case 3: return relayStatus.r3 === 1;
      case 4: return relayStatus.r4 === 1;
      default: return false;
    }
  };

  const toggleRelay = (index: number) => {
    const currentState = getRelayIsOn(index);
    const newState = currentState ? 0 : 1;
    setRelayStatus((prev: any) => ({ ...prev, [`r${index}`]: newState }));
    const command = `r${index}_${currentState ? 'off' : 'on'}`;
    sendCommand(command);
  };

  const setVariation = (mode: string) => {
    if (mode === 'v1_on') {
      setRelayStatus((prev: any) => ({ ...prev, v1: 1, v2: 0 }));
    } else if (mode === 'v2_on') {
      setRelayStatus((prev: any) => ({ ...prev, v1: 0, v2: 1 }));
    } else if (mode === 'v_stop') {
      setRelayStatus((prev: any) => ({ ...prev, v1: 0, v2: 0, r1: 0, r2: 0, r3: 0, r4: 0 }));
    } else if (mode === 'all_on') {
      setRelayStatus((prev: any) => ({ ...prev, r1: 1, r2: 1, r3: 1, r4: 1 }));
    } else if (mode === 'all_off') {
      setRelayStatus((prev: any) => ({ ...prev, r1: 0, r2: 0, r3: 0, r4: 0 }));
    }
    sendCommand(mode);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-hidden">
      
        {/* Header section */}
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-6 md:px-8 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
                IOT-SMARTLIGHT <span className="hidden md:inline text-slate-500 font-mono text-xs uppercase">v2.1.0</span>
              </h1>
              <p className="text-xs font-mono text-slate-500">ID: {activeDeviceId}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="hidden md:flex px-3 py-1.5 rounded bg-slate-800 border border-slate-700 items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
              <span className="text-xs font-semibold">MQTT: {connected ? 'ACTIVE' : 'OFFLINE'}</span>
            </div>
            
            <form onSubmit={handleConnect} className="flex gap-2">
              <div className="flex items-center text-xs font-mono bg-slate-900 border border-slate-700 rounded px-3 py-1.5 focus-within:border-slate-500 transition">
                <span className="text-slate-500 mr-2 select-none">ID:</span>
                <input 
                  type="text"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="XX (demo)"
                  className="outline-none bg-transparent w-20 md:w-36 text-slate-200"
                />
              </div>
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 md:px-4 py-1.5 rounded transition"
              >
                SET
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
          
          {/* SENSORS */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
            >
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ambient Temperature</span>
              <div className="flex items-end gap-2 my-4">
                <span className="text-6xl font-light text-white font-mono leading-none">{sensorData.suhu.toFixed(1)}</span>
                <span className="text-3xl text-orange-400 font-light mb-1">°C</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000" 
                  style={{ width: `${Math.min(100, Math.max(0, sensorData.suhu * 2))}%` }}
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
            >
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Air Humidity</span>
              <div className="flex items-end gap-2 my-4">
                <span className="text-6xl font-light text-white font-mono leading-none">{sensorData.kelembaban.toFixed(1)}</span>
                <span className="text-3xl text-cyan-400 font-light mb-1">%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000"
                  style={{ width: `${Math.min(100, Math.max(0, sensorData.kelembaban))}%` }}
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col min-h-[300px]"
            >
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Events</span>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-slate-600 italic">No events yet...</div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex gap-3 leading-tight border-b border-slate-800/50 pb-2 last:border-0">
                      <span className="text-slate-600 shrink-0">[{log.time}]</span>
                      <span className={`break-all ${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'sent' ? 'text-indigo-400' :
                        log.type === 'received' ? 'text-emerald-400' :
                        'text-slate-300'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
          {/* RELAYS & EFFECTS */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kontrol Relay</h2>
                 <div className="flex gap-2">
                    <button onClick={() => setVariation('all_on')} className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-bold transition">ALL ON</button>
                    <button onClick={() => setVariation('all_off')} className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-bold transition">ALL OFF</button>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((index, i) => {
                  const isOn = getRelayIsOn(index);
                  return (
                    <motion.div
                      key={`relay-${index}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <button
                        onClick={() => toggleRelay(index)}
                        className={`w-full p-6 rounded-2xl flex flex-col items-center gap-3 relative overflow-hidden transition-all duration-300
                          ${isOn 
                            ? 'bg-emerald-500/10 border border-emerald-500/50' 
                            : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                          }
                        `}
                      >
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
                           ${isOn ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-500'}
                         `}>
                           <Power className="w-6 h-6" />
                         </div>
                         <span className={`font-bold transition-colors ${isOn ? 'text-white' : 'text-slate-400'}`}>RELAY {index}</span>
                         <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-tighter transition-colors ${isOn ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                           {isOn ? 'ON' : 'OFF'}
                         </span>
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Automation Modes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
                <button
                  onClick={() => setVariation('v1_on')}
                  className={`group text-left p-6 rounded-xl border transition-colors
                    ${relayStatus.v1 === 1 
                      ? 'border-indigo-500 bg-indigo-500/10' 
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }
                  `}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded flex items-center justify-center border ${relayStatus.v1 === 1 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                      <Zap className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Variasi 1: Disco</h4>
                      <p className="text-xs text-slate-500 hidden xl:block">Rapid sequence</p>
                    </div>
                  </div>
                  <div className={`w-full py-2 md:py-3 text-center rounded-lg font-bold text-xs transition-all ${relayStatus.v1 === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'}`}>
                    {relayStatus.v1 === 1 ? 'ACTIVE' : 'ACTIVATE MODE'}
                  </div>
                </button>

                <button
                  onClick={() => setVariation('v2_on')}
                  className={`group text-left p-6 rounded-xl border transition-colors
                    ${relayStatus.v2 === 1 
                      ? 'border-amber-500 bg-amber-500/10' 
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }
                  `}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded flex items-center justify-center border ${relayStatus.v2 === 1 ? 'bg-amber-500 border-amber-400 text-slate-900' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      <Layers className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Variasi 2: Step</h4>
                      <p className="text-xs text-slate-500 hidden xl:block">Gradual progress</p>
                    </div>
                  </div>
                  <div className={`w-full py-2 md:py-3 text-center rounded-lg font-bold text-xs transition-all ${relayStatus.v2 === 1 ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'}`}>
                    {relayStatus.v2 === 1 ? 'ACTIVE' : 'START SEQUENCE'}
                  </div>
                </button>

                <button
                  onClick={() => setVariation('v_stop')}
                  className="group text-left p-6 rounded-xl border border-red-500/20 bg-slate-800 hover:border-red-500/50 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded flex items-center justify-center border bg-red-500/10 text-red-400 border-red-500/20">
                      <Square className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Stop Mode</h4>
                      <p className="text-xs text-slate-500 hidden xl:block">All relays OFF</p>
                    </div>
                  </div>
                  <div className="w-full py-2 md:py-3 text-center rounded-lg font-bold text-xs bg-red-500/10 text-red-400 border border-red-500/30 group-hover:bg-red-500/20 transition-all">
                    KILL SYSTEM
                  </div>
                </button>
              </div>
            </div>

            {/* System Footer Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-center md:text-left">
                <div className="text-[10px] sm:text-xs font-mono text-slate-500 flex gap-2 justify-center">
                  TOPIC CMD: <span className="text-slate-300">smartlight/{activeDeviceId}/cmd</span>
                </div>
                <div className="text-[10px] sm:text-xs font-mono text-slate-500 flex gap-2 justify-center">
                  TOPIC SENSOR: <span className="text-slate-300">smartlight/{activeDeviceId}/sensor</span>
                </div>
              </div>
              <div className="text-[10px] sm:text-xs font-mono text-slate-500">
                Ensure ESP32 code uses ID: <code className="text-slate-300">{activeDeviceId}</code>
              </div>
            </div>

          </div>
        </main>
    </div>
  );
}
