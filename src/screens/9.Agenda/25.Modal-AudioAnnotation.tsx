import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, TextInput } from 'react-native';
import { Svg, Path, G, Rect } from 'react-native-svg';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import AudioWaveBars from '../../components/audio/AudioWaveBars';
import { PauseCircleIcon } from '../../components/content/ContentIcons';
import ModalAlertExitAudio from './26.ModalAlert-ExitAudio';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave?: (payload: { name: string; durationMs?: number; uri?: string; waveHeights?: number[] }) => void;
  onReset?: () => void;
  // Modo de operaÃ§Ã£o: criaÃ§Ã£o de novo Ã¡udio ou ediÃ§Ã£o de existente
  mode?: 'create' | 'edit';
  // Nome inicial quando estiver editando
  initialName?: string;
  // URI inicial (caso de ediÃ§Ã£o, para eventualmente substituir ao salvar)
  initialUri?: string;
  // Ondas iniciais capturadas (modo ediÃ§Ã£o)
  initialWaveHeights?: number[];
};

// Ãcone: microfone dentro de cÃ­rculo azul (usar SVG de "Icone Audio 01.txt")
const MicCircle: React.FC<{ size?: number }> = ({ size = 70 }) => (
  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
    <Rect width={size} height={size} rx={size / 2} fill="#1777CF" />
    <G transform={`translate(${(size - 18) / 2}, ${(size - 28) / 2})`}>
      <Path d="M18 14.4612C18 13.9012 17.5699 13.4729 17.0074 13.4729C16.4449 13.4729 16.0147 13.9012 16.0147 14.4612C16.0147 18.3153 12.8713 21.4447 9 21.4447C5.12868 21.4447 1.98529 18.3153 1.98529 14.4612C1.98529 13.9012 1.55515 13.4729 0.992647 13.4729C0.430147 13.4729 0 13.9012 0 14.4612C0 19.04 3.44118 22.8941 8.00735 23.3882V26.0235H4.40074C3.83824 26.0235 3.40809 26.4518 3.40809 27.0118C3.40809 27.5718 3.83824 28 4.40074 28H13.5993C14.1618 28 14.5919 27.5718 14.5919 27.0118C14.5919 26.4518 14.1618 26.0235 13.5993 26.0235H9.99265V23.3882C14.5588 22.8941 18 19.04 18 14.4612Z" fill="#FCFCFC"/>
      <Path d="M9 0C5.95588 0 3.47426 2.47059 3.47426 5.50118V14.4282C3.47426 17.4918 5.95588 19.9294 9 19.9624C12.0441 19.9624 14.5257 17.4918 14.5257 14.4612V5.50118C14.5257 2.47059 12.0441 0 9 0Z" fill="#FCFCFC"/>
    </G>
  </Svg>
);

// Ãcone: "Avatar falando" (alto-falante) Ã  esquerda da linha pontilhada
const SpeakerIcon: React.FC<{ width?: number; height?: number; color?: string }> = ({ width = 29, height = 30, color = '#7D8592' }) => (
  <Svg width={width} height={height} viewBox="0 0 29 30" fill="none">
    <Path fillRule="evenodd" clipRule="evenodd" d="M2.47561 30C2.67275 30 2.86599 29.9458 3.03365 29.8435C3.20132 29.7412 3.33677 29.5949 3.42483 29.4209L4.76449 26.7781C4.91134 26.4884 5.13709 26.2448 5.41643 26.0745C5.69576 25.9042 6.01766 25.814 6.34605 25.814H9.45541C10.3254 25.814 11.1303 25.3633 11.5774 24.6279L12.5945 22.9577C12.9216 22.4196 13.0262 21.778 12.8866 21.166C12.747 20.5539 12.3739 20.0183 11.8447 19.6702L10.3523 18.6893L12.6454 17.7195C13.0907 17.5314 13.4703 17.2186 13.7371 16.8197C14.0039 16.4209 14.1462 15.9536 14.1463 15.4758V14.6107C14.1464 14.5375 14.1698 14.4662 14.2132 14.4069C14.2566 14.3475 14.3179 14.3031 14.3882 14.28L15.6161 13.8753C16.006 13.7471 16.3574 13.5252 16.6385 13.2295C16.9197 12.9339 17.1218 12.5738 17.2267 12.1819C17.3315 11.7899 17.3358 11.3784 17.2391 10.9844C17.1424 10.5904 16.9478 10.2264 16.6729 9.92512L12.4785 5.32884C12.1863 5.00866 12.0245 4.59313 12.0244 4.16233V1.04651C12.0244 0.768959 11.9126 0.502775 11.7136 0.306516C11.5147 0.110257 11.2448 0 10.9634 0H1.06098C0.779587 0 0.509724 0.110257 0.310753 0.306516C0.111781 0.502775 0 0.768959 0 1.04651V28.9535C0 29.5312 0.475317 30 1.06098 30H2.47561ZM23.9384 13.0144C25.7336 14.4865 26.878 16.7051 26.878 19.186C26.878 21.667 25.7336 23.8856 23.9384 25.3577C23.722 25.5351 23.5858 25.7901 23.5599 26.0666C23.5341 26.3431 23.6206 26.6183 23.8005 26.8319C23.9804 27.0454 24.2389 27.1797 24.5192 27.2052C24.7995 27.2307 25.0786 27.1454 25.2951 26.9679C27.5585 25.1107 29 22.313 29 19.186C29 16.0591 27.5585 13.2614 25.2951 11.4042C25.0786 11.2267 24.7995 11.1414 24.5192 11.1669C24.2389 11.1924 23.9804 11.3267 23.8005 11.5402C23.6206 11.7538 23.5341 12.029 23.5599 12.3055C23.5858 12.582 23.722 12.837 23.9384 13.0144Z" fill={color}/>
    <Path fillRule="evenodd" clipRule="evenodd" d="M21.0667 15.8051C22.0499 16.6116 22.6766 17.827 22.6766 19.186C22.6766 20.5451 22.0499 21.7605 21.0667 22.567C20.9595 22.6548 20.8709 22.7627 20.806 22.8843C20.7411 23.0059 20.701 23.139 20.6882 23.2759C20.6754 23.4128 20.6901 23.5508 20.7314 23.6821C20.7726 23.8134 20.8397 23.9354 20.9288 24.0412C21.0179 24.1469 21.1272 24.2343 21.2505 24.2983C21.3738 24.3624 21.5087 24.4019 21.6475 24.4145C21.7863 24.4271 21.9262 24.4127 22.0594 24.372C22.1925 24.3313 22.3162 24.2651 22.4234 24.1772C23.8748 22.987 24.7985 21.1912 24.7985 19.186C24.7985 17.1809 23.8748 15.3851 22.4234 14.1949C22.3162 14.107 22.1925 14.0408 22.0594 14.0001C21.9262 13.9594 21.7863 13.945 21.6475 13.9576C21.5087 13.9702 21.3738 14.0097 21.2505 14.0738C21.1272 14.1378 21.0179 14.2252 20.9288 14.3309C20.8397 14.4367 20.7726 14.5587 20.7314 14.69C20.6901 14.8213 20.6754 14.9593 20.6882 15.0962C20.701 15.2331 20.7411 15.3662 20.806 15.4878C20.8709 15.6094 20.9595 15.7173 21.0667 15.8051ZM17.5669 17.8981C17.7593 18.0548 17.9142 18.2516 18.0206 18.4742C18.1269 18.6969 18.1821 18.9399 18.1821 19.186C18.1821 19.4322 18.1269 19.6752 18.0206 19.8979C17.9142 20.1205 17.7593 20.3172 17.5669 20.474C17.3504 20.6514 17.2143 20.9064 17.1884 21.1829C17.1626 21.4593 17.2491 21.7346 17.429 21.9481C17.6089 22.1617 17.8674 22.296 18.1477 22.3215C18.428 22.347 18.7071 22.2616 18.9236 22.0842C19.7667 21.3921 20.3028 20.3512 20.3028 19.186C20.3028 18.0209 19.7667 16.98 18.9236 16.2879C18.8164 16.2 18.6927 16.1339 18.5596 16.0931C18.4264 16.0524 18.2865 16.038 18.1477 16.0506C18.0089 16.0632 17.874 16.1027 17.7507 16.1668C17.6274 16.2308 17.5181 16.3182 17.429 16.424C17.3399 16.5297 17.2728 16.6517 17.2316 16.783C17.1903 16.9143 17.1756 17.0523 17.1884 17.1892C17.2012 17.3261 17.2413 17.4592 17.3062 17.5808C17.3711 17.7024 17.4597 17.8103 17.5669 17.8981Z" fill={color}/>
  </Svg>
);

// Ãcone: "ComeÃ§ar de novo" (usar SVG de "Icone Audio 01.txt")
const RestartIcon: React.FC<{ width?: number; height?: number }> = ({ width = 21, height = 18 }) => (
  <Svg width={width} height={height} viewBox="0 0 21 18" fill="none">
    <Path d="M6.23233 10.271C6.52365 9.93209 6.28634 9.40286 5.84298 9.40286H4.51557C4.50672 9.26877 4.50222 9.13441 4.50208 9.00002C4.50208 5.64556 7.19273 2.91655 10.5 2.91655C12.0893 2.91655 13.536 3.54699 14.6104 4.57399L16.4822 2.35302C14.8437 0.832735 12.735 0 10.5 0C8.12981 0 5.9015 0.936188 4.22551 2.63603C2.54957 4.33592 1.62654 6.596 1.62654 8.99998C1.62654 9.13477 1.62986 9.26902 1.63564 9.40282H0.517553C0.0741941 9.40282 -0.16316 9.93205 0.128205 10.271L2.65046 13.2054L3.18025 13.8218L5.08236 11.6088L6.23233 10.271ZM20.8718 8.55899L18.9906 6.37031L17.8198 5.00821L16.1482 6.95295L14.7677 8.55899C14.4764 8.89794 14.7137 9.42717 15.1571 9.42717H16.4829C16.266 12.583 13.6657 15.0835 10.5 15.0835C9.11815 15.0835 7.8441 14.6068 6.82883 13.8073L4.95692 16.0285C6.52508 17.3058 8.45982 18 10.5001 18C12.8702 18 15.0986 17.0639 16.7745 15.364C18.3509 13.7652 19.2609 11.6708 19.3635 9.42722H20.4825C20.9258 9.42717 21.1631 8.89794 20.8718 8.55899Z" fill="#3A3F51"/>
  </Svg>
);

const ModalAudioAnnotation: React.FC<Props> = ({ visible, onClose, onSave, onReset, mode = 'create', initialName, initialUri, initialWaveHeights }) => {
  const [name, setName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [confirmExitVisible, setConfirmExitVisible] = useState(false);
  const recordingRef = useRef<InstanceType<typeof Audio.Recording> | null>(null);
  const MAX_BARS = 40;
  const [waveHeights, setWaveHeights] = useState<number[]>([]);
  const tickRef = useRef<any>(null);
  
  // Web: refs para gravaÃ§Ã£o real com MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const timerRef = useRef<any>(null);
  const recordedBlobUriRef = useRef<string | null>(null);
  const amplitudeRef = useRef<number>(0);

  // FunÃ§Ã£o para obter amplitude do microfone em tempo real
  const getAmplitude = useCallback((): number => {
    const analyser = analyserRef.current;
    const audioContext = audioContextRef.current;
    
    // Se nÃ£o hÃ¡ analyser ou audioContext, retornar 0 (silÃªncio)
    if (!analyser) {
      console.warn('[AudioModal] getAmplitude: analyser Ã© null');
      return 0;
    }
    
    if (!audioContext || audioContext.state !== 'running') {
      console.warn('[AudioModal] getAmplitude: audioContext nÃ£o estÃ¡ running:', audioContext?.state);
      return 0;
    }
    
    try {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Usar getByteTimeDomainData para obter a forma de onda
      analyser.getByteTimeDomainData(dataArray);
      
      // Calcular RMS (Root Mean Square) para obter a amplitude
      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i++) {
        // Normalizar de 0-255 para -1 a 1 (128 Ã© o ponto zero)
        const normalized = (dataArray[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      
      const rms = Math.sqrt(sumSquares / bufferLength);
      
      // Amplificar o RMS para melhor visualizaÃ§Ã£o
      const amplified = Math.min(1, rms * 5);
      
      return amplified;
    } catch (err) {
      console.error('[AudioModal] Erro em getAmplitude:', err);
      return 0;
    }
  }, []);

  // Reset automÃ¡tico ao abrir o modal novamente
  useEffect(() => {
    if (visible) {
      console.log('[AudioModal] abrir', { mode, initialUri });
      setName(mode === 'edit' ? (initialName ?? '') : '');
      // Em ediÃ§Ã£o, preservar ondas anteriores; em criaÃ§Ã£o, iniciar vazio
      setWaveHeights(mode === 'edit' ? (initialWaveHeights ?? []) : []);
      setIsRecording(false);
      setIsPaused(false);
      
      // Limpar recursos anteriores
      cleanupWebRecording();
      
      if (Platform.OS !== 'web') {
        const rec = recordingRef.current;
        if (rec) {
          try { rec.stopAndUnloadAsync(); } catch {}
        }
        recordingRef.current = null;
      }
      
      if (mode === 'create') {
        setDurationMs(0);
        pausedDurationRef.current = 0;
        if (onReset) onReset();
      } else {
        // Editar: tentar obter duraÃ§Ã£o do Ã¡udio existente
        if (initialUri) {
          prefetchDurationForUri(initialUri).then((ms) => {
            console.log('[AudioModal] duraÃ§Ã£o prÃ©-carregada (edit)', ms);
            if (ms > 0) setDurationMs(ms);
          });
        } else {
          setDurationMs(0);
        }
      }
    } else {
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [visible, mode, initialName, initialUri]);

  // Limpar recursos de gravaÃ§Ã£o Web
  const cleanupWebRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch {}
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    // Revogar blob URI anterior se existir
    if (recordedBlobUriRef.current) {
      try { URL.revokeObjectURL(recordedBlobUriRef.current); } catch {}
      recordedBlobUriRef.current = null;
    }
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      cleanupWebRecording();
    };
  }, [cleanupWebRecording]);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        console.log('[AudioModal] Web: iniciando gravaÃ§Ã£o real com MediaRecorder');
        
        // Limpar gravaÃ§Ã£o anterior
        cleanupWebRecording();
        audioChunksRef.current = [];
        recordedBlobUriRef.current = null;
        
        // Verificar se o navegador suporta MediaRecorder
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error('[AudioModal] ERRO: navegador nÃ£o suporta getUserMedia');
          alert('Seu navegador nÃ£o suporta gravaÃ§Ã£o de Ã¡udio');
          return;
        }
        
        // IMPORTANTE: Tentar encontrar o microfone REAL do dispositivo
        // Evitar microfones virtuais como "HitPaw Virtual Audio"
        let selectedDeviceId: string | undefined;
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter(d => d.kind === 'audioinput');
          console.log('[AudioModal] Microfones disponÃ­veis:', audioInputs.map(d => ({ id: d.deviceId, label: d.label })));
          
          // Procurar por microfone real (evitar virtuais)
          const virtualKeywords = ['virtual', 'hitpaw', 'voicemod', 'cable', 'vb-audio', 'stereo mix', 'wave'];
          const realMic = audioInputs.find(d => {
            const label = (d.label || '').toLowerCase();
            return !virtualKeywords.some(kw => label.includes(kw));
          });
          
          if (realMic && realMic.deviceId) {
            selectedDeviceId = realMic.deviceId;
            console.log('[AudioModal] Microfone real selecionado:', realMic.label);
          } else if (audioInputs.length > 0) {
            // Se nÃ£o encontrou real, usar o primeiro disponÃ­vel (geralmente o padrÃ£o)
            selectedDeviceId = audioInputs[0].deviceId !== 'default' ? audioInputs[0].deviceId : undefined;
            console.log('[AudioModal] Usando microfone padrÃ£o:', audioInputs[0].label);
          }
        } catch (err) {
          console.warn('[AudioModal] Erro ao enumerar dispositivos:', err);
        }
        
        // Solicitar permissÃ£o e obter stream do microfone
        console.log('[AudioModal] Solicitando acesso ao microfone...');
        let stream: MediaStream;
        try {
          const constraints: MediaStreamConstraints = {
            audio: selectedDeviceId 
              ? { deviceId: { exact: selectedDeviceId } }
              : true
          };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
          console.warn('[AudioModal] Falha com deviceId especÃ­fico, tentando padrÃ£o:', err);
          // Fallback: tentar sem deviceId especÃ­fico
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (err2) {
            console.error('[AudioModal] Erro ao acessar microfone:', err2);
            alert('NÃ£o foi possÃ­vel acessar o microfone. Verifique as permissÃµes.');
            return;
          }
        }
        
        const audioTrack = stream.getAudioTracks()[0];
        console.log('[AudioModal] Microfone obtido:', {
          label: audioTrack?.label,
          enabled: audioTrack?.enabled,
          muted: audioTrack?.muted,
          readyState: audioTrack?.readyState,
        });
        
        // AVISO: Verificar se Ã© microfone virtual
        const trackLabel = (audioTrack?.label || '').toLowerCase();
        if (trackLabel.includes('virtual') || trackLabel.includes('hitpaw')) {
          console.warn('[AudioModal] AVISO: Microfone virtual detectado! A gravaÃ§Ã£o pode nÃ£o capturar sua voz.');
          console.warn('[AudioModal] Por favor, selecione o microfone fÃ­sico nas configuraÃ§Ãµes do navegador.');
        }
        
        streamRef.current = stream;
        
        // Criar AudioContext APENAS para anÃ¡lise de amplitude (visualizaÃ§Ã£o)
        // NÃƒO conectar ao destino para nÃ£o interferir na gravaÃ§Ã£o
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          console.log('[AudioModal] AudioContext criado:', {
            state: audioContext.state,
            sampleRate: audioContext.sampleRate,
          });
          
          // Alguns navegadores precisam resumir o AudioContext
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
            console.log('[AudioModal] AudioContext resumed:', audioContext.state);
          }
          
          audioContextRef.current = audioContext;
          
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 512; // Aumentar para melhor precisÃ£o
          analyser.smoothingTimeConstant = 0.3; // SuavizaÃ§Ã£o
          source.connect(analyser);
          // NÃƒO conectar ao destino: analyser.connect(audioContext.destination);
          analyserRef.current = analyser;
          
          console.log('[AudioModal] Analyser configurado:', {
            fftSize: analyser.fftSize,
            frequencyBinCount: analyser.frequencyBinCount,
          });
        } catch (err) {
          console.warn('[AudioModal] Erro ao criar AudioContext para anÃ¡lise:', err);
          // Continuar sem anÃ¡lise de amplitude
        }
        
        // Verificar suporte ao MediaRecorder
        if (typeof MediaRecorder === 'undefined') {
          console.error('[AudioModal] ERRO: MediaRecorder nÃ£o suportado');
          alert('Seu navegador nÃ£o suporta gravaÃ§Ã£o de Ã¡udio');
          return;
        }
        
        // Determinar melhor mimeType suportado
        const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/ogg',
          'audio/mp4',
          '', // fallback sem especificar mimeType
        ];
        
        let selectedMimeType = '';
        for (const type of mimeTypes) {
          if (type === '' || MediaRecorder.isTypeSupported(type)) {
            selectedMimeType = type;
            break;
          }
        }
        console.log('[AudioModal] Usando mimeType:', selectedMimeType || '(padrÃ£o do navegador)');
        
        // Criar MediaRecorder para gravaÃ§Ã£o real
        let mediaRecorder: MediaRecorder;
        try {
          const options: MediaRecorderOptions = {};
          if (selectedMimeType) {
            options.mimeType = selectedMimeType;
          }
          mediaRecorder = new MediaRecorder(stream, options);
        } catch (err) {
          console.error('[AudioModal] Erro ao criar MediaRecorder:', err);
          // Tentar sem opÃ§Ãµes
          mediaRecorder = new MediaRecorder(stream);
        }
        
        console.log('[AudioModal] MediaRecorder criado:', {
          mimeType: mediaRecorder.mimeType,
          state: mediaRecorder.state,
        });
        mediaRecorderRef.current = mediaRecorder;
        
        // Coletar dados de Ã¡udio
        mediaRecorder.ondataavailable = (event) => {
          console.log('[AudioModal] ondataavailable:', {
            size: event.data?.size,
            type: event.data?.type,
          });
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            console.log('[AudioModal] Chunk adicionado, total:', audioChunksRef.current.length);
          }
        };
        
        mediaRecorder.onerror = (event: any) => {
          console.error('[AudioModal] Erro no MediaRecorder:', event.error || event);
        };
        
        mediaRecorder.onstart = () => {
          console.log('[AudioModal] MediaRecorder.onstart - gravaÃ§Ã£o iniciada');
        };
        
        mediaRecorder.onstop = () => {
          console.log('[AudioModal] MediaRecorder.onstop - gravaÃ§Ã£o parada');
        };
        
        // Iniciar gravaÃ§Ã£o com timeslice de 1000ms
        mediaRecorder.start(1000);
        console.log('[AudioModal] MediaRecorder.start(1000) chamado, state:', mediaRecorder.state);
        
        // Marcar tempo de inÃ­cio
        recordingStartTimeRef.current = Date.now();
        pausedDurationRef.current = 0;
        setDurationMs(0);
        setWaveHeights([]);
        setIsPaused(false);
        setIsRecording(true);
        
        // Timer para atualizar duraÃ§Ã£o em tempo real
        timerRef.current = setInterval(() => {
          const elapsed = Date.now() - recordingStartTimeRef.current;
          setDurationMs(elapsed);
        }, 100);
        
        return;
      }
      
      // Native (iOS/Android)
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.warn('[AudioModal] PermissÃ£o de microfone negada');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      rec.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          setDurationMs(status.durationMillis ?? 0);
        }
      });
      await rec.startAsync();
      recordingRef.current = rec;
      setWaveHeights([]);
      setIsPaused(false);
      setIsRecording(true);
    } catch (err) {
      console.warn('[AudioModal] Erro ao iniciar gravaÃ§Ã£o:', err);
    }
  };

  const pauseRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.pause();
        }
        // Pausar timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // Salvar duraÃ§Ã£o pausada
        pausedDurationRef.current = Date.now() - recordingStartTimeRef.current;
        setIsRecording(false);
        setIsPaused(true);
        return;
      }
      const rec = recordingRef.current;
      if (!rec) return;
      await rec.pauseAsync();
      setIsRecording(false);
      setIsPaused(true);
    } catch (err) {
      console.warn('[AudioModal] Erro ao pausar gravaÃ§Ã£o:', err);
    }
  };

  const resumeRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.resume();
        }
        // Ajustar tempo de inÃ­cio para continuar de onde parou
        recordingStartTimeRef.current = Date.now() - pausedDurationRef.current;
        // Reiniciar timer
        timerRef.current = setInterval(() => {
          const elapsed = Date.now() - recordingStartTimeRef.current;
          setDurationMs(elapsed);
        }, 50);
        setIsPaused(false);
        setIsRecording(true);
        return;
      }
      const rec = recordingRef.current;
      if (!rec) return;
      await rec.startAsync();
      setIsPaused(false);
      setIsRecording(true);
    } catch (err) {
      console.warn('[AudioModal] Erro ao retomar gravaÃ§Ã£o:', err);
    }
  };

  const stopRecording = async (): Promise<string | undefined> => {
    try {
      if (Platform.OS === 'web') {
        console.log('[AudioModal] Web: parando gravaÃ§Ã£o');
        console.log('[AudioModal] Chunks antes de parar:', audioChunksRef.current.length);
        
        // Parar timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        const recorder = mediaRecorderRef.current;
        if (!recorder) {
          console.warn('[AudioModal] MediaRecorder Ã© null');
          return undefined;
        }
        
        console.log('[AudioModal] MediaRecorder state:', recorder.state);
        
        if (recorder.state === 'inactive') {
          console.warn('[AudioModal] MediaRecorder jÃ¡ estÃ¡ inativo');
          // Se jÃ¡ temos chunks, criar o blob mesmo assim
          if (audioChunksRef.current.length > 0) {
            const mimeType = recorder.mimeType || 'audio/webm';
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            const audioUrl = URL.createObjectURL(audioBlob);
            recordedBlobUriRef.current = audioUrl;
            return audioUrl;
          }
          return undefined;
        }
        
        return new Promise<string | undefined>((resolve) => {
          // Timeout de seguranÃ§a caso onstop nÃ£o seja chamado
          const timeoutId = setTimeout(() => {
            console.warn('[AudioModal] Timeout esperando onstop');
            if (audioChunksRef.current.length > 0) {
              const mimeType = recorder.mimeType || 'audio/webm';
              const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
              const audioUrl = URL.createObjectURL(audioBlob);
              recordedBlobUriRef.current = audioUrl;
              resolve(audioUrl);
            } else {
              resolve(undefined);
            }
          }, 3000);
          
          recorder.onstop = () => {
            clearTimeout(timeoutId);
            console.log('[AudioModal] onstop chamado, chunks:', audioChunksRef.current.length);
            
            if (audioChunksRef.current.length === 0) {
              console.error('[AudioModal] ERRO: Nenhum chunk de Ã¡udio gravado!');
              resolve(undefined);
              return;
            }
            
            // Criar blob do Ã¡udio gravado
            const mimeType = recorder.mimeType || 'audio/webm';
            console.log('[AudioModal] Criando blob com mimeType:', mimeType);
            
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            
            console.log('[AudioModal] Blob criado:', { 
              size: audioBlob.size, 
              type: audioBlob.type,
              chunks: audioChunksRef.current.length,
            });
            
            if (audioBlob.size === 0) {
              console.error('[AudioModal] ERRO: Blob vazio!');
              resolve(undefined);
              return;
            }
            
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log('[AudioModal] Blob URL criada:', audioUrl);
            recordedBlobUriRef.current = audioUrl;
            
            // TESTE: Verificar se o Ã¡udio pode ser reproduzido
            const testAudio = new window.Audio(audioUrl);
            testAudio.onloadedmetadata = () => {
              console.log('[AudioModal] TESTE: Ãudio carregado, duration:', testAudio.duration);
            };
            testAudio.onerror = (e) => {
              console.error('[AudioModal] TESTE: Erro ao carregar Ã¡udio:', e);
            };
            
            // Limpar recursos do stream
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => {
                console.log('[AudioModal] Parando track:', track.kind, track.label, track.readyState);
                track.stop();
              });
              streamRef.current = null;
            }
            
            // Fechar AudioContext
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
              try { audioContextRef.current.close(); } catch {}
            }
            audioContextRef.current = null;
            analyserRef.current = null;
            
            setIsRecording(false);
            setIsPaused(false);
            
            resolve(audioUrl);
          };
          
          // Solicitar dados pendentes antes de parar
          if (recorder.state === 'recording') {
            console.log('[AudioModal] Solicitando dados finais (requestData)...');
            try {
              recorder.requestData();
            } catch (err) {
              console.warn('[AudioModal] Erro ao chamar requestData:', err);
            }
          }
          
          console.log('[AudioModal] Chamando recorder.stop()...');
          try {
            recorder.stop();
          } catch (err) {
            console.error('[AudioModal] Erro ao chamar stop:', err);
            clearTimeout(timeoutId);
            resolve(undefined);
          }
        });
      }
      
      // Native (iOS/Android)
      const rec = recordingRef.current;
      if (!rec) return undefined;
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI() || undefined;
      recordingRef.current = null;
      setIsRecording(false);
      setIsPaused(false);
      return uri;
    } catch (err) {
      console.warn('[AudioModal] Erro ao parar gravaÃ§Ã£o:', err);
      return undefined;
    }
  };

  // Tick para preencher barras progressivamente da esquerda para a direita
  useEffect(() => {
    const minH = 4;  // Altura mÃ­nima (silÃªncio)
    const maxH = 32; // Altura mÃ¡xima (som alto)
    const range = maxH - minH;
    
    // Calcula a altura da barra baseada na amplitude REAL
    // SEM adicionar ruÃ­do aleatÃ³rio - queremos representar o som fielmente
    const computeHeight = (amp: number) => {
      // Limitar amplitude entre 0 e 1
      const clampedAmp = Math.max(0, Math.min(1, amp));
      
      // Se amplitude for muito baixa (silÃªncio), manter barra bem pequena
      if (clampedAmp < 0.05) {
        return minH;
      }
      
      // Aplicar uma curva para melhor visualizaÃ§Ã£o
      const shaped = Math.pow(clampedAmp, 0.7);
      return Math.round(minH + shaped * range);
    };

    if (isRecording) {
      if (tickRef.current) clearInterval(tickRef.current);
      
      // Log inicial para verificar qual plataforma
      console.log('[AudioModal] Iniciando tick de ondas, Platform.OS:', Platform.OS);
      console.log('[AudioModal] analyserRef.current:', !!analyserRef.current);
      console.log('[AudioModal] audioContextRef.current:', !!audioContextRef.current);
      
      tickRef.current = setInterval(() => {
        let amp: number;
        if (Platform.OS === 'web') {
          // Na web, usar amplitude real do microfone
          amp = getAmplitude();
          amplitudeRef.current = amp;
        } else {
          // Native: usar amplitude simulada (nÃ£o temos acesso ao analyser)
          amp = 0.6 + Math.random() * 0.3;
        }
        setWaveHeights((prev) => {
          if (prev.length >= MAX_BARS) return prev;
          const h = computeHeight(amp);
          return [...prev, h];
        });
      }, 120);
    } else {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    }

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [isRecording, getAmplitude]);

  // Capitaliza somente a primeira letra da primeira palavra
  const handleNameChange = (text: string) => {
    if (!text) {
      setName('');
      return;
    }
    const formatted = text.charAt(0).toUpperCase() + text.slice(1);
    setName(formatted);
  };

  // Prefetch de duraÃ§Ã£o quando estiver no modo ediÃ§Ã£o
  const prefetchDurationForUri = async (uri: string): Promise<number> => {
    if (Platform.OS !== 'web') {
      try {
        const created = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false },
          undefined,
          false,
        );
        const status: any = created?.status;
        const dur = status?.durationMillis ?? 0;
        try { await created.sound?.unloadAsync?.(); } catch {}
        return typeof dur === 'number' && dur > 0 ? dur : 0;
      } catch {
        return 0;
      }
    }
    // Web
    return new Promise<number>((resolve) => {
      try {
        const el = document.createElement('audio');
        el.preload = 'auto';
        el.muted = true;
        el.style.display = 'none';
        el.src = uri;
        let settled = false;
        const cleanup = () => { try { el.pause(); } catch {}; try { el.remove(); } catch {}; };
        const finish = (secs: number) => {
          if (settled) return; settled = true; cleanup();
          const ms = Number.isFinite(secs) && secs > 0 ? Math.round(secs * 1000) : 0;
          resolve(ms);
        };
        const tryRead = () => {
          const d = el.duration;
          if (Number.isFinite(d) && d > 0 && d !== Infinity) finish(d);
        };
        el.addEventListener('loadedmetadata', () => { tryRead(); }, { once: true });
        el.addEventListener('canplay', () => { tryRead(); }, { once: true });
        el.addEventListener('durationchange', () => { tryRead(); }, { once: true });
        el.addEventListener('error', () => { cleanup(); resolve(0); }, { once: true });
        document.body.appendChild(el);
        try { el.load(); } catch {}
        setTimeout(() => { try { finish(el.duration ?? 0); } catch { cleanup(); resolve(0); } }, 8000);
      } catch {
        resolve(0);
      }
    });
  };

  const headerTitle = mode === 'edit' ? 'Editar Áudio' : 'Novo Áudio';
  // Habilita salvar somente apÃ³s 1s gravado no modo criaÃ§Ã£o
  const canSave = mode === 'create' ? durationMs >= 1000 : true;

  const handleConfirmExit = async () => {
    try {
      cleanupWebRecording();
      if (Platform.OS !== 'web') {
        const rec = recordingRef.current;
        if (rec) {
          try {
            await rec.stopAndUnloadAsync();
          } catch {}
          recordingRef.current = null;
        }
      }
    } finally {
      setIsRecording(false);
      setIsPaused(false);
      setConfirmExitVisible(false);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>{headerTitle}</Text>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setConfirmExitVisible(true)} accessibilityLabel="Fechar">
              <View style={styles.closeInnerBox}>
                <Svg width={13} height={12} viewBox="0 0 13 12" fill="none">
                  <Path d="M12.655 0.247926C12.2959 -0.0821192 11.7339 -0.0827124 11.374 0.246573L6.5 4.70646L1.62595 0.246573C1.26609 -0.0827126 0.704125 -0.0821187 0.344999 0.247926L0.291597 0.297004C-0.0977822 0.654853 -0.0971065 1.25701 0.293074 1.61404L5.08634 6L0.293074 10.386C-0.0971063 10.743 -0.0977808 11.3451 0.291598 11.703L0.345 11.7521C0.704126 12.0821 1.26609 12.0827 1.62595 11.7534L6.5 7.29354L11.374 11.7534C11.7339 12.0827 12.2959 12.0821 12.655 11.7521L12.7084 11.703C13.0978 11.3451 13.0971 10.743 12.7069 10.386L7.91366 6L12.7069 1.61404C13.0971 1.25701 13.0978 0.654853 12.7084 0.297004L12.655 0.247926Z" fill="#3A3F51" />
                </Svg>
              </View>
            </TouchableOpacity>
          </View>

          {/* Mic central (inicia/parar gravaÃ§Ã£o ao clicar) */}
          <View style={styles.micRow}>
            <TouchableOpacity
              onPress={() => {
                if (isRecording) return pauseRecording();
                if (isPaused) return resumeRecording();
                return startRecording();
              }}
              accessibilityRole="button"
              accessibilityLabel={isRecording ? 'Pausar gravação' : isPaused ? 'Retomar gravação' : 'Iniciar gravação'}
              activeOpacity={0.85}
            >
              {isRecording ? (
                <PauseCircleIcon width={70} height={70} />
              ) : (
                <MicCircle size={70} />
              )}
            </TouchableOpacity>
          </View>

          {/* Faixa de execução: í­cone a esquerda, ondas centralizadas e tempo a direita */}
          <View style={styles.executionBox}>
            <View style={styles.leftIconBox}>
              <SpeakerIcon width={29} height={30} color={durationMs > 0 ? '#1777CF' : '#7D8592'} />
            </View>
            <View style={styles.rightGroup}>
              <View style={[styles.waveContainer, { width: (5.2 * MAX_BARS) - 2 }]}>
              {/* Linha pontilhada sempre visí­vel (fundo) */}
              <View style={styles.dotsRow}>
                {Array.from({ length: MAX_BARS }).map((_, i) => (
                  <View key={`dot-bg-${i}`} style={styles.dot} />
                ))}
              </View>
          {/* Barras azuis sobrepostas quando gravando/pausado */}
              {(isRecording || isPaused || (waveHeights && waveHeights.length > 0)) && (
                <View style={styles.barsRow} pointerEvents="none">
                  <AudioWaveBars
                    active
                    animate={isRecording}
                    speedMs={80}
                    progressHeights={waveHeights}
                    maxBars={MAX_BARS}
                    tailDots={2}
                    ghostCount={0}
                  />
                </View>
              )}
              </View>
              <View style={styles.timeContainer}>
                <Text
                  style={[
                    styles.timeText,
                    durationMs > 0 ? styles.timeTextActive : styles.timeTextInactive,
                  ]}
                  numberOfLines={1}
                >
                  {formatTime(durationMs)}
                </Text>
              </View>
            </View>
          </View>

          {/* Campo Nome */}
          <View style={styles.nameSection}>
            <View style={styles.nameLabelRow}>
              <Text style={styles.nameLabel}>Nome</Text>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                value={name}
                onChangeText={handleNameChange}
                placeholder="Digite o nome do seu áudio aqui..."
                placeholderTextColor="#91929E"
                autoCapitalize="sentences"
                style={styles.inputText}
              />
            </View>
          </View>

          {/* Botões inferiores */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                cleanupWebRecording();
                audioChunksRef.current = [];
                setWaveHeights([]);
                setDurationMs(0);
                setIsRecording(false);
                setIsPaused(false);
                pausedDurationRef.current = 0;
                if (onReset) onReset();
              }}
              accessibilityRole="button"
              accessibilityLabel="Começar de novo"
            >
              <RestartIcon width={21} height={18} />
              <Text style={styles.resetText}>Começar de novo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !canSave ? styles.saveBtnDisabled : null]}
              disabled={!canSave}
              onPress={async () => {
                let uri: string | undefined;
                // IMPORTANTE: Usar a duração do timer que sempre confiável
                // A duração do timer (durationMs) atualizada a cada 50ms durante a gravação
                // e representa o tempo real de gravação
                let finalDurationMs = durationMs;
                
                // Validar duração imediatamente
                if (!Number.isFinite(finalDurationMs) || finalDurationMs < 0 || Number.isNaN(finalDurationMs)) {
                  finalDurationMs = 0;
                }
                
                // Finaliza a gravação para obter a URI
                if (Platform.OS === 'web') {
                  if (isRecording || isPaused) {
                    uri = await stopRecording();
                  } else if (recordedBlobUriRef.current) {
                    uri = recordedBlobUriRef.current;
                  }
                  
                  // Não tentar obter duração do arquivo de áudio - o Blob URL pode retornar Infinity
                  // A duração do timer ao mais confiável
                  console.log('[AudioModal] Usando duraÃ§Ã£o do timer:', finalDurationMs);
                } else {
                  const rec = recordingRef.current;
                  if (rec) {
                    try {
                      await rec.stopAndUnloadAsync();
                      uri = rec.getURI() || undefined;
                      recordingRef.current = null;
                    } catch (err) {
                      console.warn('[AudioModal] Erro ao finalizar gravação:', err);
                    }
                  }
                }
                
                // Garantir que a duração um número válido (validação final)
                finalDurationMs = Math.max(0, Math.round(finalDurationMs));
                
                console.log('[AudioModal] Salvando áudio:', { name, durationMs: finalDurationMs, uri, waveHeightsCount: waveHeights.length });
                onSave?.({ name, durationMs: finalDurationMs, uri, waveHeights });
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel="Salvar"
              accessibilityState={{ disabled: !canSave }}
            >
              <Text style={[styles.saveText, !canSave ? styles.saveTextDisabled : null]}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ModalAlertExitAudio
        visible={confirmExitVisible}
        itemLabel={mode === 'edit' ? (initialName ? initialName : 'Conteúdo') : 'Conteúdo'}
        onCancel={() => setConfirmExitVisible(false)}
        onConfirm={handleConfirmExit}
      />
    </Modal>
  );
};

export default ModalAudioAnnotation;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 339,
    minHeight: 415,
    backgroundColor: '#FCFCFC',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0.12 : 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    color: '#3A3F51',
    fontFamily: 'Inter_600SemiBold',
  },
  closeIcon: {
    padding: 0,
  },
  closeInnerBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
  },
  micRow: {
    alignItems: 'center',
    paddingTop: 20,
  },
  executionBox: {
    marginTop: 40,
    alignSelf: 'stretch',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  rightGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  leftIconBox: {
    height: '100%',
    justifyContent: 'center',
  },
  waveContainer: {
    flexGrow: 0,
    flexShrink: 0,
    marginLeft: 10,
    marginRight: 2,
    height: '100%',
    position: 'relative',
  },
  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    columnGap: 2,
  },
  barsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    columnGap: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 4,
    opacity: 0.4,
    backgroundColor: '#7D8592',
  },
  timeContainer: {
    width: 56,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 20,
  },
  timeText: {
    marginLeft: 0,
    marginRight: 0,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  timeTextInactive: {
    color: '#7D8592',
  },
  timeTextActive: {
    color: '#1777CF',
  },
  nameSection: {
    marginTop: 40,
    rowGap: 6,
  },
  nameLabelRow: {
    paddingHorizontal: 6,
  },
  nameLabel: {
    color: '#7D8592',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    backgroundColor: '#FCFCFC',
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: 40,
    justifyContent: 'center',
  },
  inputText: {
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'center',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  footerRow: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 309,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    backgroundColor: '#D3D3D31F',
    paddingHorizontal: 14,
    paddingVertical: 9,
    height: 40,
  },
  resetText: {
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 19,
  },
  saveBtn: {
    borderRadius: 8,
    backgroundColor: '#1777CF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 40,
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#D8E0F0',
  },
  saveText: {
    color: '#FCFCFC',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },
  saveTextDisabled: {
    color: '#FCFCFCB3',
  },
});