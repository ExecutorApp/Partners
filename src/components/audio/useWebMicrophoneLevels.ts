import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

type LevelsResult = {
  levels: number[];
  elapsedMs: number;
  amplitude: number; // 0..1 (RMS do sinal)
};

// Hook para capturar níveis de áudio via WebAudio no ambiente web.
// Não grava arquivo; serve para visualização (ondas em tempo real).
export default function useWebMicrophoneLevels(running: boolean, barCount = 40, sessionId: number = 0): LevelsResult {
  const [levels, setLevels] = useState<number[]>(Array(barCount).fill(0));
  const [elapsedMs, setElapsedMs] = useState(0);
  const [amplitude, setAmplitude] = useState(0);

  const startRef = useRef<number>(0);
  const accRef = useRef<number>(0);
  const streamRef = useRef<any>(null); // MediaStream (tipado como any para compatibilidade RN)
  const audioCtxRef = useRef<any>(null); // AudioContext
  const analyserRef = useRef<any>(null); // AnalyserNode
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return; // apenas web

    let cancelled = false;

    const start = async () => {
      try {
        const stream = await (navigator as any).mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AC();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256; // equilíbrio entre granularidade e custo
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;
        source.connect(analyser);

        const bufFreq = new Uint8Array(analyser.frequencyBinCount);
        const bufTime = new Uint8Array(analyser.fftSize);
        startRef.current = Date.now();

        const loop = () => {
          if (cancelled) return;
          // Frequência para dar algum desenho às barras
          analyser.getByteFrequencyData(bufFreq);
          const step = Math.max(1, Math.floor(bufFreq.length / barCount));
          const vals: number[] = [];
          for (let i = 0; i < barCount; i++) {
            const idx = i * step;
            vals.push((bufFreq[idx] ?? 0) / 255); // normaliza 0..1
          }
          setLevels(vals);

          // Time-domain para amplitude global (RMS)
          analyser.getByteTimeDomainData(bufTime);
          let sum = 0;
          for (let i = 0; i < bufTime.length; i++) {
            const v = bufTime[i] - 128; // centrado em ~128
            sum += v * v;
          }
          const rms = Math.sqrt(sum / bufTime.length) / 128; // 0..~1
          // Suave com leve inércia
          const prev = amplitude;
          const smooth = prev * 0.8 + rms * 0.2;
          setAmplitude(Math.max(0, Math.min(1, smooth)));

          const now = Date.now();
          setElapsedMs(accRef.current + (startRef.current ? (now - startRef.current) : 0));
          rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.warn('[useWebMicrophoneLevels] getUserMedia falhou', err);
      }
    };

    const stop = () => {
      // Acumula tempo até o momento da pausa
      if (startRef.current) {
        try { accRef.current += Date.now() - startRef.current; } catch {}
      }
      startRef.current = 0;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (analyserRef.current) analyserRef.current.disconnect();
      analyserRef.current = null;
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
        audioCtxRef.current = null;
      }
      if (streamRef.current) {
        try { streamRef.current.getTracks().forEach((t: any) => t.stop()); } catch {}
        streamRef.current = null;
      }
    };

    if (running) start();
    else stop();

    return () => { cancelled = true; stop(); };
  }, [running, barCount, sessionId]);

  // Reinicia acumulador quando o sessionId muda (novo ciclo “Começar de novo”)
  useEffect(() => {
    accRef.current = 0;
    startRef.current = 0;
    setElapsedMs(0);
  }, [sessionId]);

  return { levels, elapsedMs, amplitude };
}