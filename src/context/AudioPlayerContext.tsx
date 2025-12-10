import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

export type AudioTrack = {
  id: string;
  title: string;
  uri: string;
  durationMs?: number;
};

type AudioPlayerContextValue = {
  playlist: AudioTrack[];
  currentIndex: number | null;
  isPlaying: boolean;
  positionMillis: number;
  displayPositionMillis: number;
  durationMillis: number;
  progress: number;
  autoNextEnabled: boolean;
  playbackRate: number;
  repeatEnabled: boolean;
  durationsByIndex: number[];
  playAt: (index: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seekToFraction: (fraction: number) => Promise<void>;
  deactivate: () => Promise<void>;
  setAutoNextEnabled: (enabled: boolean) => void;
  setPlaybackRate: (rate: number) => Promise<void>;
  setRepeatEnabled: (enabled: boolean) => Promise<void>;
};

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

type ProviderProps = {
  children: React.ReactNode;
  playlist: AudioTrack[];
  audioDurations?: Record<string, number>;
};

const DEBUG = true;
const IS_WEB = Platform.OS === 'web';

// ============================================
// PLAYER WEB NATIVO - Usa HTMLAudioElement diretamente
// para garantir detecção correta do evento 'ended'
// ============================================
class WebAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private onEndedCallback: (() => void) | null = null;
  private onTimeUpdateCallback: ((position: number, duration: number) => void) | null = null;
  private onPlayCallback: (() => void) | null = null;
  private onPauseCallback: (() => void) | null = null;
  private onErrorCallback: ((error: any) => void) | null = null;
  private boundHandleEnded: (() => void) | null = null;

  async load(uri: string): Promise<void> {
    this.unload();
    
    return new Promise((resolve, reject) => {
      this.audio = new window.Audio();
      this.audio.preload = 'auto';
      
      // CRÍTICO: Evento 'ended' para AutoPlay
      this.boundHandleEnded = () => {
        if (DEBUG) console.log('[WebAudioPlayer] ========= EVENTO ENDED DISPARADO =========');
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      };
      this.audio.addEventListener('ended', this.boundHandleEnded);
      
      // Atualização de tempo
      this.audio.addEventListener('timeupdate', () => {
        if (this.audio && this.onTimeUpdateCallback) {
          const position = (this.audio.currentTime || 0) * 1000;
          let duration = (this.audio.duration || 0) * 1000;
          if (!Number.isFinite(duration)) duration = 0;
          this.onTimeUpdateCallback(position, duration);
        }
      });
      
      // Play/Pause
      this.audio.addEventListener('play', () => {
        if (DEBUG) console.log('[WebAudioPlayer] evento play');
        if (this.onPlayCallback) this.onPlayCallback();
      });
      
      this.audio.addEventListener('pause', () => {
        if (DEBUG) console.log('[WebAudioPlayer] evento pause');
        if (this.onPauseCallback) this.onPauseCallback();
      });
      
      // Erro
      this.audio.addEventListener('error', (e) => {
        console.error('[WebAudioPlayer] Erro ao carregar:', e);
        if (this.onErrorCallback) this.onErrorCallback(e);
        reject(new Error('Erro ao carregar áudio'));
      });
      
      // Pronto para tocar
      const onCanPlay = () => {
        if (DEBUG) console.log('[WebAudioPlayer] canplaythrough - áudio pronto para reprodução');
        resolve();
      };
      
      this.audio.addEventListener('canplaythrough', onCanPlay, { once: true });
      
      // Timeout de segurança
      const timeout = setTimeout(() => {
        if (DEBUG) console.log('[WebAudioPlayer] timeout - resolvendo mesmo assim');
        resolve();
      }, 5000);
      
      this.audio.addEventListener('canplaythrough', () => clearTimeout(timeout), { once: true });
      
      // Iniciar carregamento
      this.audio.src = uri;
      this.audio.load();
    });
  }

  async play(): Promise<void> {
    if (!this.audio) {
      console.warn('[WebAudioPlayer] Tentativa de play sem áudio carregado');
      return;
    }
    try {
      if (DEBUG) console.log('[WebAudioPlayer] Iniciando play...');
      await this.audio.play();
      if (DEBUG) console.log('[WebAudioPlayer] Play iniciado com sucesso');
    } catch (err) {
      console.error('[WebAudioPlayer] Erro ao iniciar play:', err);
      throw err;
    }
  }

  pause(): void {
    if (!this.audio) return;
    if (DEBUG) console.log('[WebAudioPlayer] Pausando...');
    this.audio.pause();
  }

  async setPosition(ms: number): Promise<void> {
    if (!this.audio) return;
    const seconds = ms / 1000;
    if (DEBUG) console.log('[WebAudioPlayer] setPosition:', { ms, seconds });
    this.audio.currentTime = seconds;
  }

  setRate(rate: number): void {
    if (!this.audio) return;
    if (DEBUG) console.log('[WebAudioPlayer] setRate:', rate);
    this.audio.playbackRate = rate;
  }

  getPosition(): number {
    return this.audio ? (this.audio.currentTime || 0) * 1000 : 0;
  }

  getDuration(): number {
    if (!this.audio) return 0;
    const dur = this.audio.duration * 1000;
    return Number.isFinite(dur) ? dur : 0;
  }

  isCurrentlyPlaying(): boolean {
    return this.audio ? !this.audio.paused && !this.audio.ended : false;
  }

  unload(): void {
    if (this.audio) {
      if (DEBUG) console.log('[WebAudioPlayer] Descarregando áudio...');
      // Remover listener de ended
      if (this.boundHandleEnded) {
        this.audio.removeEventListener('ended', this.boundHandleEnded);
      }
      this.audio.pause();
      this.audio.src = '';
      this.audio.load(); // Liberar recursos
      this.audio = null;
    }
  }

  // Callbacks
  onEnded(callback: () => void): void {
    this.onEndedCallback = callback;
  }

  onTimeUpdate(callback: (position: number, duration: number) => void): void {
    this.onTimeUpdateCallback = callback;
  }

  onPlay(callback: () => void): void {
    this.onPlayCallback = callback;
  }

  onPause(callback: () => void): void {
    this.onPauseCallback = callback;
  }

  onError(callback: (error: any) => void): void {
    this.onErrorCallback = callback;
  }
}

// ============================================
// PROVIDER PRINCIPAL
// ============================================
export const AudioPlayerProvider: React.FC<ProviderProps> = ({ children, playlist, audioDurations }) => {
  // Para Web, usamos player nativo HTMLAudioElement
  const webPlayerRef = useRef<WebAudioPlayer | null>(null);
  // Para nativo (iOS/Android), usamos expo-av
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // Estados
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [autoNextEnabled, setAutoNextEnabled] = useState(true);
  const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
  const [repeatEnabled, setRepeatEnabledState] = useState<boolean>(false);
  const [uiTick, setUiTick] = useState<number>(0);
  const [durationsByIndex, setDurationsByIndex] = useState<number[]>([]);
  const [audioModeReady, setAudioModeReady] = useState(false);
  
  // REFS CRÍTICOS - para acessar valores atuais dentro de callbacks assíncronos
  const autoNextEnabledRef = useRef(autoNextEnabled);
  const repeatEnabledRef = useRef(repeatEnabled);
  const currentIndexRef = useRef(currentIndex);
  const playlistRef = useRef(playlist);
  const playbackRateRef = useRef(playbackRate);
  const isHandlingEndRef = useRef(false);
  const activeTrackIdRef = useRef<string | null>(null);
  
  // Refs de UI
  const lastStatusTsRef = useRef<number>(Date.now());
  const rafIdRef = useRef<number | null>(null);
  const fallbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationsCacheRef = useRef<Record<string, number>>({});
  
  // Manter refs sincronizados com state (MUITO IMPORTANTE!)
  useEffect(() => { autoNextEnabledRef.current = autoNextEnabled; }, [autoNextEnabled]);
  useEffect(() => { repeatEnabledRef.current = repeatEnabled; }, [repeatEnabled]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { playbackRateRef.current = playbackRate; }, [playbackRate]);

  // ============================================
  // OBTER DURAÇÃO CONHECIDA PARA UM ÍNDICE
  // ============================================
  const getKnownDuration = useCallback((index: number): number => {
    const track = playlistRef.current[index];
    if (!track) return 0;
    
    // Prioridade: audioDurations > track.durationMs > durationsByIndex > cache
    if (audioDurations && audioDurations[track.id] > 0) {
      return audioDurations[track.id];
    }
    if (track.durationMs && track.durationMs > 0) {
      return track.durationMs;
    }
    if (durationsByIndex[index] > 0) {
      return durationsByIndex[index];
    }
    if (track.uri && durationsCacheRef.current[track.uri] > 0) {
      return durationsCacheRef.current[track.uri];
    }
    return 0;
  }, [audioDurations, durationsByIndex]);

  // ============================================
  // UI TICKER - para atualização suave da interface
  // ============================================
  const startUiTicker = useCallback(() => {
    // Parar ticker existente
    if (rafIdRef.current) {
      try { cancelAnimationFrame(rafIdRef.current); } catch {}
      rafIdRef.current = null;
    }
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
    
    const hasRAF = typeof requestAnimationFrame === 'function';
    
    if (hasRAF) {
      const loop = () => {
        rafIdRef.current = requestAnimationFrame(loop);
        setUiTick((t) => (t + 1) & 1023);
      };
      loop();
    } else {
      fallbackIntervalRef.current = setInterval(() => {
        setUiTick((t) => (t + 1) & 1023);
      }, 250);
    }
  }, []);

  const stopUiTicker = useCallback(() => {
    if (rafIdRef.current) {
      try { cancelAnimationFrame(rafIdRef.current); } catch {}
      rafIdRef.current = null;
    }
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
  }, []);

  // ============================================
  // DESCARREGAR ÁUDIO ATUAL
  // ============================================
  const unloadCurrent = useCallback(async () => {
    if (IS_WEB) {
      if (webPlayerRef.current) {
        webPlayerRef.current.unload();
        webPlayerRef.current = null;
      }
    } else {
      try { await soundRef.current?.stopAsync(); } catch {}
      try { await soundRef.current?.unloadAsync(); } catch {}
      soundRef.current = null;
    }
  }, []);

  // ============================================
  // HANDLER DE FIM DO ÁUDIO (FUNÇÃO CRÍTICA!)
  // Esta função é chamada quando o áudio termina
  // ============================================
  const handleAudioEnded = useCallback(async () => {
    // Prevenir chamadas duplicadas
    if (isHandlingEndRef.current) {
      if (DEBUG) console.log('[AudioPlayer] handleAudioEnded - já processando, ignorando chamada duplicada');
      return;
    }
    isHandlingEndRef.current = true;
    
    // Ler valores atuais das refs (NÃO do state!)
    const index = currentIndexRef.current;
    const autoNext = autoNextEnabledRef.current;
    const repeat = repeatEnabledRef.current;
    const pl = playlistRef.current;
    const rate = playbackRateRef.current;
    
    if (DEBUG) {
      console.log('[AudioPlayer] ======================================');
      console.log('[AudioPlayer] ÁUDIO TERMINOU - PROCESSANDO FIM');
      console.log('[AudioPlayer] ======================================');
      console.log('[AudioPlayer] Estado atual:', {
        currentIndex: index,
        autoNextEnabled: autoNext,
        repeatEnabled: repeat,
        playlistLength: pl.length,
        playbackRate: rate,
      });
    }
    
    if (index === null) {
      if (DEBUG) console.log('[AudioPlayer] Índice nulo, ignorando');
      isHandlingEndRef.current = false;
      return;
    }
    
    // ========================================
    // CASO 1: REPETIÇÃO ATIVADA
    // ========================================
    if (repeat) {
      if (DEBUG) console.log('[AudioPlayer] REPETIÇÃO ATIVADA - reiniciando áudio atual');
      
      try {
        if (IS_WEB && webPlayerRef.current) {
          await webPlayerRef.current.setPosition(0);
          await webPlayerRef.current.play();
        } else if (soundRef.current) {
          await soundRef.current.setPositionAsync(0);
          await soundRef.current.playAsync();
        }
        setPositionMillis(0);
        setIsPlaying(true);
        if (DEBUG) console.log('[AudioPlayer] Áudio reiniciado com sucesso');
      } catch (err) {
        console.error('[AudioPlayer] Erro ao repetir áudio:', err);
        setIsPlaying(false);
      }
      
      isHandlingEndRef.current = false;
      return;
    }
    
    // ========================================
    // CASO 2: AUTOPLAY ATIVADO
    // ========================================
    if (autoNext) {
      const isLast = index >= (pl.length - 1);
      
      if (!isLast) {
        const nextIndex = index + 1;
        const nextTrack = pl[nextIndex];
        
        if (DEBUG) {
          console.log('[AudioPlayer] AUTOPLAY ATIVADO - pulando para próximo');
          console.log('[AudioPlayer] Próximo índice:', nextIndex);
          console.log('[AudioPlayer] Próxima track:', nextTrack?.title);
        }
        
        try {
          // Descarregar atual
          await unloadCurrent();
          
          // Resetar flag antes de carregar próximo
          isHandlingEndRef.current = false;
          
          // Carregar e tocar próximo
          await loadAndPlayIndexInternal(nextIndex);
          
          if (DEBUG) console.log('[AudioPlayer] AUTOPLAY - próximo áudio iniciado com sucesso!');
        } catch (err) {
          console.error('[AudioPlayer] AUTOPLAY - Erro ao carregar próximo áudio:', err);
          setIsPlaying(false);
          setPositionMillis(0);
          stopUiTicker();
          isHandlingEndRef.current = false;
        }
        return;
      } else {
        if (DEBUG) console.log('[AudioPlayer] AUTOPLAY - é o último áudio da playlist, parando');
      }
    } else {
      if (DEBUG) console.log('[AudioPlayer] AUTOPLAY DESATIVADO');
    }
    
    // ========================================
    // CASO 3: SEM REPETIÇÃO E SEM AUTOPLAY
    // ========================================
    if (DEBUG) console.log('[AudioPlayer] FIM DA REPRODUÇÃO - parando e resetando para início');
    
    setIsPlaying(false);
    setPositionMillis(0);
    stopUiTicker();
    
    try {
      if (IS_WEB && webPlayerRef.current) {
        webPlayerRef.current.pause();
        await webPlayerRef.current.setPosition(0);
      } else if (soundRef.current) {
        await soundRef.current.pauseAsync();
        await soundRef.current.setPositionAsync(0);
      }
    } catch (err) {
      console.error('[AudioPlayer] Erro ao resetar posição:', err);
    }
    
    isHandlingEndRef.current = false;
  }, [unloadCurrent, stopUiTicker]);

  // ============================================
  // CARREGAR E TOCAR UM ÍNDICE (FUNÇÃO INTERNA)
  // ============================================
  const loadAndPlayIndexInternal = useCallback(async (index: number): Promise<void> => {
    const pl = playlistRef.current;
    const track = pl[index];
    
    if (!track) {
      throw new Error(`Track não encontrada no índice ${index}`);
    }
    
    if (DEBUG) {
      console.log('[AudioPlayer] ----------------------------------------');
      console.log('[AudioPlayer] loadAndPlayIndex:', { 
        index, 
        title: track.title, 
        uri: track.uri.substring(0, 80),
        playlistLength: pl.length,
      });
    }
    
    // Descarregar áudio atual
    await unloadCurrent();
    
    // Resetar flag de handling
    isHandlingEndRef.current = false;
    
    const rate = playbackRateRef.current;
    
    if (IS_WEB) {
      // ========================================
      // WEB: Usar HTMLAudioElement nativo
      // ========================================
      if (DEBUG) console.log('[AudioPlayer] Usando WebAudioPlayer (HTMLAudioElement)');
      
      const player = new WebAudioPlayer();
      webPlayerRef.current = player;
      
      // CRÍTICO: Configurar callback de fim ANTES de carregar
      player.onEnded(() => {
        if (DEBUG) console.log('[AudioPlayer] WebPlayer.onEnded() callback executado');
        handleAudioEnded();
      });
      
      // Callbacks de atualização
      player.onTimeUpdate((pos, dur) => {
        setPositionMillis(pos);
        if (dur > 0) setDurationMillis(dur);
        lastStatusTsRef.current = Date.now();
      });
      
      player.onPlay(() => {
        if (DEBUG) console.log('[AudioPlayer] WebPlayer.onPlay()');
        setIsPlaying(true);
      });
      
      player.onPause(() => {
        if (DEBUG) console.log('[AudioPlayer] WebPlayer.onPause()');
        // Não setar isPlaying=false aqui, pois pode ser chamado durante transição
      });
      
      player.onError((err) => {
        console.error('[AudioPlayer] Erro no WebPlayer:', err);
        setIsPlaying(false);
      });
      
      // Carregar áudio
      await player.load(track.uri);
      
      // Aplicar taxa de reprodução
      player.setRate(rate);
      
      // Definir índice atual ANTES de tocar
      setCurrentIndex(index);
      activeTrackIdRef.current = track.id;
      setPositionMillis(0);
      
      // Definir duração conhecida
      let dur = player.getDuration();
      if (dur <= 0) dur = getKnownDuration(index);
      if (dur > 0) {
        setDurationMillis(dur);
        // Cachear
        durationsCacheRef.current[track.uri] = dur;
      }
      
      // Iniciar reprodução
      await player.play();
      
      setIsPlaying(true);
      startUiTicker();
      
      if (DEBUG) console.log('[AudioPlayer] WebPlayer iniciado com sucesso');
      
    } else {
      // ========================================
      // NATIVO (iOS/Android): Usar expo-av
      // ========================================
      if (DEBUG) console.log('[AudioPlayer] Usando expo-av (nativo)');
      
      const sound = new Audio.Sound();
      soundRef.current = sound;
      
      await sound.loadAsync({ uri: track.uri }, { shouldPlay: false }, true);
      
      // Configurar callback de status
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!('isLoaded' in status) || !status.isLoaded) return;
        const s = status as AVPlaybackStatusSuccess;
        
        setPositionMillis(s.positionMillis ?? 0);
        
        let dur = s.durationMillis ?? 0;
        if (!Number.isFinite(dur) || dur <= 0) {
          dur = getKnownDuration(index);
        }
        if (dur > 0) setDurationMillis(dur);
        
        setIsPlaying(s.isPlaying ?? false);
        lastStatusTsRef.current = Date.now();
        
        // Detectar fim no nativo
        if (s.didJustFinish && !isHandlingEndRef.current) {
          if (DEBUG) console.log('[AudioPlayer] expo-av didJustFinish detectado');
          handleAudioEnded();
        }
      });
      
      await sound.setProgressUpdateIntervalAsync(250);
      try { await sound.setRateAsync(rate, true as any); } catch {}
      
      setCurrentIndex(index);
      activeTrackIdRef.current = track.id;
      
      // Definir duração conhecida
      const knownDur = getKnownDuration(index);
      if (knownDur > 0) setDurationMillis(knownDur);
      
      await sound.playAsync();
      
      setIsPlaying(true);
      startUiTicker();
      
      if (DEBUG) console.log('[AudioPlayer] expo-av iniciado com sucesso');
    }
    
    if (DEBUG) console.log('[AudioPlayer] loadAndPlayIndex concluído para índice:', index);
  }, [unloadCurrent, getKnownDuration, handleAudioEnded, startUiTicker]);

  // ============================================
  // DEACTIVATE - Desativar player completamente
  // ============================================
  const deactivate = useCallback(async () => {
    await unloadCurrent();
    setIsPlaying(false);
    setCurrentIndex(null);
    activeTrackIdRef.current = null;
    setPositionMillis(0);
    setDurationMillis(0);
    stopUiTicker();
    isHandlingEndRef.current = false;
    if (DEBUG) console.log('[AudioPlayer] deactivate - player desativado');
  }, [unloadCurrent, stopUiTicker]);

  useEffect(() => {
    const pl = playlist;
    const len = pl.length;
    if (len === 0 && currentIndex !== null) {
      void deactivate();
      return;
    }
    const id = activeTrackIdRef.current;
    if (id) {
      const idx = pl.findIndex(t => t.id === id);
      if (idx === -1) {
        void deactivate();
      } else if (currentIndex !== idx) {
        setCurrentIndex(idx);
      }
    } else if (currentIndex !== null && (currentIndex < 0 || currentIndex >= len)) {
      void deactivate();
    }
  }, [playlist, currentIndex, deactivate]);

  // ============================================
  // ACTIONS PÚBLICAS
  // ============================================
  const playAt = useCallback(async (index: number) => {
    if (index < 0 || index >= playlistRef.current.length) {
      if (DEBUG) console.log('[AudioPlayer] playAt: índice inválido', { index, length: playlistRef.current.length });
      return;
    }
    
    try {
      await loadAndPlayIndexInternal(index);
    } catch (err) {
      console.error('[AudioPlayer] playAt erro:', err);
    }
  }, [loadAndPlayIndexInternal]);

  const pause = useCallback(async () => {
    try {
      if (IS_WEB && webPlayerRef.current) {
        webPlayerRef.current.pause();
      } else if (soundRef.current) {
        await soundRef.current.pauseAsync();
      }
      setIsPlaying(false);
      stopUiTicker();
      if (DEBUG) console.log('[AudioPlayer] pause');
    } catch (err) {
      console.error('[AudioPlayer] pause erro:', err);
    }
  }, [stopUiTicker]);

  const resume = useCallback(async () => {
    try {
      // Resetar flag para permitir nova detecção de fim
      isHandlingEndRef.current = false;
      
      const rate = playbackRateRef.current;
      
      if (IS_WEB && webPlayerRef.current) {
        webPlayerRef.current.setRate(rate);
        await webPlayerRef.current.play();
      } else if (soundRef.current) {
        try { await soundRef.current.setRateAsync(rate, true as any); } catch {}
        await soundRef.current.playAsync();
      }
      
      setIsPlaying(true);
      startUiTicker();
      if (DEBUG) console.log('[AudioPlayer] resume');
    } catch (err) {
      console.error('[AudioPlayer] resume erro:', err);
    }
  }, [startUiTicker]);

  const togglePlay = useCallback(async () => {
    const hasPlayer = IS_WEB ? !!webPlayerRef.current : !!soundRef.current;
    
    if (!hasPlayer) {
      if (playlistRef.current.length > 0) {
        await playAt(0);
      }
      return;
    }
    
    if (isPlaying) {
      await pause();
    } else {
      await resume();
    }
  }, [isPlaying, playAt, pause, resume]);

  const next = useCallback(async () => {
    const pl = playlistRef.current;
    if (pl.length === 0) return;
    
    const idx = currentIndexRef.current;
    const nextIndex = idx === null ? 0 : Math.min(pl.length - 1, idx + 1);
    
    try {
      await loadAndPlayIndexInternal(nextIndex);
      if (DEBUG) console.log('[AudioPlayer] next', { nextIndex });
    } catch (err) {
      console.error('[AudioPlayer] next erro:', err);
    }
  }, [loadAndPlayIndexInternal]);

  const prev = useCallback(async () => {
    const pl = playlistRef.current;
    if (pl.length === 0) return;
    
    const idx = currentIndexRef.current;
    const prevIndex = idx === null ? 0 : Math.max(0, idx - 1);
    
    try {
      await loadAndPlayIndexInternal(prevIndex);
      if (DEBUG) console.log('[AudioPlayer] prev', { prevIndex });
    } catch (err) {
      console.error('[AudioPlayer] prev erro:', err);
    }
  }, [loadAndPlayIndexInternal]);

  const seekToFraction = useCallback(async (fraction: number) => {
    const dur = durationMillis > 0 ? durationMillis : 0;
    if (dur <= 0) return;
    
    const target = Math.max(0, Math.min(1, fraction)) * dur;
    
    try {
      if (IS_WEB && webPlayerRef.current) {
        await webPlayerRef.current.setPosition(target);
      } else if (soundRef.current) {
        await soundRef.current.setPositionAsync(target);
      }
      
      setPositionMillis(target);
      
      // Resetar flag se fez seek para longe do fim
      if (fraction < 0.95) {
        isHandlingEndRef.current = false;
      }
      
      if (DEBUG) console.log('[AudioPlayer] seekTo', { fraction, target });
    } catch (err) {
      console.error('[AudioPlayer] seekTo erro:', err);
    }
  }, [durationMillis]);

  // ============================================
  // INICIALIZAÇÃO
  // ============================================
  useEffect(() => {
    if (!IS_WEB) {
      // Configurar modo de áudio para nativo
      (async () => {
        try {
          await Audio.setAudioModeAsync({
            staysActiveInBackground: false,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            allowsRecordingIOS: false,
            shouldDuckAndroid: true,
          });
        } catch {}
        setAudioModeReady(true);
      })();
    } else {
      setAudioModeReady(true);
    }

    // Cleanup ao desmontar
    return () => {
      if (IS_WEB && webPlayerRef.current) {
        webPlayerRef.current.unload();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
      stopUiTicker();
    };
  }, [stopUiTicker]);

  // Prefetch durações quando playlist muda
  useEffect(() => {
    if (!audioModeReady) return;
    
    const initialDurations = playlist.map((track) => {
      if (audioDurations && audioDurations[track.id] > 0) return audioDurations[track.id];
      if (track.durationMs && track.durationMs > 0) return track.durationMs;
      const cached = track.uri ? durationsCacheRef.current[track.uri] : undefined;
      if (typeof cached === 'number' && cached > 0) return cached;
      return 0;
    });

    setDurationsByIndex(initialDurations);
    if (DEBUG) console.log('[AudioPlayer] Durações iniciais:', initialDurations);
  }, [audioModeReady, playlist, audioDurations]);

  // Atualizar duração quando track ativa muda
  useEffect(() => {
    if (currentIndex == null || currentIndex < 0) return;
    
    const knownDuration = getKnownDuration(currentIndex);
    if (knownDuration > 0) {
      setDurationsByIndex((prev) => {
        const next = [...prev];
        if (next.length < playlist.length) next.length = playlist.length;
        next[currentIndex] = knownDuration;
        return next;
      });
    }
  }, [currentIndex, playlist, audioDurations, getKnownDuration]);

  // ============================================
  // VALOR DO CONTEXTO
  // ============================================
  const value: AudioPlayerContextValue = useMemo(() => {
    // Calcular posição de display (interpolada para UI suave)
    const displayPositionMillis = (() => {
      if (!isPlaying) return positionMillis;
      const dt = Math.max(0, Date.now() - (lastStatusTsRef.current || Date.now()));
      const est = positionMillis + dt;
      if (durationMillis > 0) return Math.min(est, durationMillis);
      return est;
    })();

    // Calcular progresso (0..1)
    const progress = (() => {
      if (durationMillis > 0) return Math.min(1, displayPositionMillis / durationMillis);
      return 0;
    })();

    return {
      playlist,
      currentIndex,
      isPlaying,
      positionMillis,
      displayPositionMillis,
      durationMillis,
      progress,
      autoNextEnabled,
      playbackRate,
      repeatEnabled,
      durationsByIndex,
      playAt,
      togglePlay,
      pause,
      resume,
      next,
      prev,
      seekToFraction,
      deactivate,
      setAutoNextEnabled: (enabled: boolean) => {
        if (DEBUG) console.log('[AudioPlayer] setAutoNextEnabled:', enabled);
        setAutoNextEnabled(enabled);
      },
      setPlaybackRate: async (rate: number) => {
        const clamped = Math.max(0.25, Math.min(3.0, rate));
        if (DEBUG) console.log('[AudioPlayer] setPlaybackRate:', clamped);
        setPlaybackRateState(clamped);
        try {
          if (IS_WEB && webPlayerRef.current) {
            webPlayerRef.current.setRate(clamped);
          } else if (soundRef.current) {
            await soundRef.current.setRateAsync(clamped, true as any);
          }
        } catch {}
      },
      setRepeatEnabled: async (enabled: boolean) => {
        if (DEBUG) console.log('[AudioPlayer] setRepeatEnabled:', enabled);
        setRepeatEnabledState(enabled);
      },
    };
  }, [
    playlist, 
    currentIndex, 
    isPlaying, 
    positionMillis, 
    durationMillis, 
    autoNextEnabled, 
    playbackRate, 
    repeatEnabled, 
    uiTick, 
    durationsByIndex,
    playAt,
    togglePlay,
    pause,
    resume,
    next,
    prev,
    seekToFraction,
    deactivate,
  ]);

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
};

// ============================================
// HOOK DE USO
// ============================================
export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
};
