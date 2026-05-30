// VoiceCommand.tsx
// Widget UI mic dengan animasi + integrasi Gemini AI

import { useVoiceCommand, VoiceResult } from './useVoiceCommand';

interface Props {
  onCommand?: (result: VoiceResult) => void;
  mqttPublish?: (cmd: string) => void;
}

const EXAMPLES = [
  'nyalakan lampu ruang tamu',
  'matikan semua lampu',
  'hidupin relay dua',
  'cek suhu sekarang',
  'nyalain relay 3 sama 4',
  'matiin lampu kamar',
  'semua lampu on',
  'cek kelembaban',
];

const CMD_LABEL: Record<string, string> = {
  r1_on: '💡 R1 ON', r1_off: '⬛ R1 OFF',
  r2_on: '💡 R2 ON', r2_off: '⬛ R2 OFF',
  r3_on: '💡 R3 ON', r3_off: '⬛ R3 OFF',
  r4_on: '💡 R4 ON', r4_off: '⬛ R4 OFF',
  all_on: '⚡ Semua ON', all_off: '🌑 Semua OFF',
  get_sensor: '🌡️ Baca Sensor', status: '📋 Status',
  unknown: '❓ Tidak dikenal',
};

export function VoiceCommand({ onCommand, mqttPublish }: Props) {
  const {
    status, transcript, lastResult,
    startListening, stopListening, simulateVoice, isListening,
  } = useVoiceCommand(onCommand ?? (() => {}), mqttPublish);

  return (
    <div style={{ background: '#161b22', border: '0.5px solid #30363d', borderRadius: 8, padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontWeight: 500, color: '#e6edf3' }}>Perintah Suara</span>
        <span style={{ fontSize: 11, background: '#3C3489', color: '#CECBF6', borderRadius: 4, padding: '2px 8px' }}>
          GEMINI AI
        </span>
      </div>

      {/* Tombol Mic */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            width: 72, height: 72, borderRadius: '50%', border: 'none',
            background: isListening ? '#a32d2d' : '#534AB7',
            fontSize: 28, cursor: 'pointer', transition: 'all 0.2s',
            animation: isListening ? 'pulse 1s infinite' : 'none',
          }}
        >
          {isListening ? '🔴' : '🎙️'}
        </button>
        <p style={{ fontSize: 12, color: '#8b949e', marginTop: 8 }}>
          {isListening ? 'Mendengarkan...' : 'Klik untuk mulai'}
        </p>
      </div>

      {/* Transcript */}
      <div style={{
        background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12,
        border: `0.5px solid ${status === 'listening' || status === 'processing' ? '#534AB7' : '#30363d'}`,
        color: '#CECBF6', minHeight: 40, marginBottom: 8,
      }}>
        {transcript
          ? `🎙️ "${transcript}"`
          : 'Ucapkan perintah setelah klik tombol mic...'}
      </div>

      {/* Hasil parse */}
      {lastResult && (
        <div style={{
          background: '#0d1117', borderRadius: 6, padding: 10, fontSize: 12,
          border: `0.5px solid ${lastResult.command !== 'unknown' ? '#3fb950' : '#f85149'}`,
          color: lastResult.command !== 'unknown' ? '#3fb950' : '#f85149',
          marginBottom: 12,
        }}>
          {lastResult.command !== 'unknown'
            ? `✅ ${lastResult.source === 'gemini' ? '🤖 Gemini' : '🔧 Local'}: ${CMD_LABEL[lastResult.command] ?? lastResult.command} → dikirim ke ESP32`
            : '❓ Perintah tidak dikenali'}
        </div>
      )}

      {/* Status processing */}
      {status === 'processing' && (
        <div style={{ fontSize: 12, color: '#79c0ff', marginBottom: 12 }}>
          ⏳ Memproses dengan Gemini AI...
        </div>
      )}

      {/* Contoh perintah */}
      <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 6 }}>Contoh perintah:</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => simulateVoice(ex)}
            style={{
              background: '#1f1f3a', border: '0.5px solid #534AB7', color: '#CECBF6',
              borderRadius: 20, padding: '4px 12px', fontSize: 11, cursor: 'pointer',
            }}
          >
            {ex}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(163,45,45,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(163,45,45,0); }
        }
      `}</style>
    </div>
  );
}
