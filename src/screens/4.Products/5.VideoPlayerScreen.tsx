import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  Animated,
  PanResponder,
  Platform,
  Image,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Asset } from 'expo-asset';
// Import de expo-asset para resolver URIs de vídeos em todas as plataformas
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import TrainingScreen from './4.TrainingScreen';
import { videoSources, videoModules, posterModules, resolveVideoUri } from './videoLibrary';


// **DEBUG EXTENSIVO**: Log inicial dos vídeos
console.log('🎬 [DEBUG] VideoPlayerScreen carregado');
console.log('🎬 [DEBUG] Platform.OS:', Platform.OS);
console.log('🎬 [DEBUG] videoSources:', videoSources);
console.log('🎬 [DEBUG] window.location:', typeof window !== 'undefined' ? window.location.href : 'N/A');

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AutoPlayerIcon = () => (
  <Svg width="34" height="18" viewBox="0 0 34 18" fill="none">
    <Path d="M20.1628 3.13043H5.93023C4.35744 3.13043 2.84906 3.74883 1.73692 4.84959C0.624791 5.95035 0 7.44329 0 9C0 10.5567 0.624791 12.0497 1.73692 13.1504C2.84906 14.2512 4.35744 14.8696 5.93023 14.8696H20.1628C20.4773 14.8696 20.779 14.7459 21.0015 14.5257C21.2239 14.3056 21.3488 14.007 21.3488 13.6956V4.30435C21.3488 3.993 21.2239 3.69442 21.0015 3.47426C20.779 3.25411 20.4773 3.13043 20.1628 3.13043Z" fill="#FCFCFC"/>
    <Path d="M24.907 18C29.9289 18 34 13.9706 34 9C34 4.02944 29.9289 0 24.907 0C19.885 0 15.814 4.02944 15.814 9C15.814 13.9706 19.885 18 24.907 18Z" fill="#1777CF"/>
    <Path d="M28.7814 8.06087L24.0372 4.53913C23.861 4.40832 23.6515 4.32867 23.4321 4.30909C23.2127 4.28951 22.9922 4.33078 22.7952 4.42828C22.5982 4.52578 22.4325 4.67565 22.3167 4.8611C22.2009 5.04655 22.1395 5.26025 22.1395 5.47826V12.5217C22.1395 12.7397 22.2009 12.9535 22.3167 13.1389C22.4325 13.3244 22.5982 13.4742 22.7952 13.5717C22.9922 13.6692 23.2127 13.7105 23.4321 13.6909C23.6515 13.6713 23.861 13.5917 24.0372 13.4609L28.7814 9.93913C28.9287 9.82978 29.0483 9.68799 29.1306 9.52499C29.2129 9.36199 29.2558 9.18224 29.2558 9C29.2558 8.81776 29.2129 8.63801 29.1306 8.47501C29.0483 8.31201 28.9287 8.17022 28.7814 8.06087Z" fill="#FCFCFC"/>
  </Svg>
);

// Toggle de AutoPlay com visual estilo YouTube (cinza/desligado esquerda, azul/ligado direita)
const AutoPlaySwitch: React.FC<{ isOn: boolean }> = ({ isOn }) => (
  <View style={{
    width: 34,
    height: 18,
    borderRadius: 999,
    backgroundColor: isOn ? '#1777CF' : '#91929E',
    paddingHorizontal: 2,
    justifyContent: 'center',
  }}>
    <View style={{
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#FFFFFF',
      alignSelf: isOn ? 'flex-end' : 'flex-start',
    }} />
  </View>
);

const ConfigIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path d="M18.9033 7.82833L17.3366 7.62917C17.2074 7.23167 17.0482 6.84833 16.8624 6.48417L17.8299 5.23833C18.2216 4.73417 18.1758 4.0225 17.7282 3.58917L16.4157 2.27667C15.9782 1.825 15.2665 1.78 14.7614 2.17083L13.5172 3.13833C13.153 2.9525 12.7697 2.79333 12.3713 2.66417L12.1722 1.1C12.0972 0.4725 11.5646 0 10.9338 0H9.06704C8.43618 0 7.90366 0.4725 7.82866 1.0975L7.62948 2.66417C7.23113 2.79333 6.84778 2.95167 6.4836 3.13833L5.23855 2.17083C4.7352 1.78 4.0235 1.825 3.58932 2.2725L2.27676 3.58417C1.82508 4.0225 1.77924 4.73417 2.17092 5.23917L3.13846 6.48417C2.95179 6.84833 2.79345 7.23167 2.66428 7.62917L1.10005 7.82833C0.47252 7.90333 0 8.43583 0 9.06667V10.9333C0 11.5642 0.47252 12.0967 1.09755 12.1717L2.66428 12.3708C2.79345 12.7683 2.95262 13.1517 3.13846 13.5158L2.17092 14.7617C1.77924 15.2658 1.82508 15.9775 2.27259 16.4108L3.58515 17.7233C4.0235 18.1742 4.73436 18.2192 5.23938 17.8283L6.48444 16.8608C6.84862 17.0475 7.23197 17.2067 7.62948 17.335L7.82866 18.8983C7.90366 19.5275 8.43618 20 9.06704 20H10.9338C11.5646 20 12.0972 19.5275 12.1722 18.9025L12.3713 17.3358C12.7689 17.2067 13.1522 17.0475 13.5164 16.8617L14.7623 17.8292C15.2665 18.2208 15.9782 18.175 16.4115 17.7275L17.7241 16.415C18.1758 15.9767 18.2216 15.2658 17.8299 14.7608L16.8624 13.5158C17.049 13.1517 17.2082 12.7683 17.3366 12.3708L18.9 12.1717C19.5275 12.0967 20 11.5642 20 10.9333V9.06667C20.0008 8.43583 19.5283 7.90333 18.9033 7.82833ZM10.0004 14.1667C7.70282 14.1667 5.83358 12.2975 5.83358 10C5.83358 7.7025 7.70282 5.83333 10.0004 5.83333C12.298 5.83333 14.1673 7.7025 14.1673 10C14.1673 12.2975 12.298 14.1667 10.0004 14.1667Z" fill="#FCFCFC"/>
  </Svg>
);

// SVGs do AutoPlay (Ativo/Inativo) conforme especificado
const AutoPlayOnSvg = () => (
  <Svg width="34" height="18" viewBox="0 0 34 18" fill="none">
    <Path d="M20.1628 3.13043H5.93023C4.35744 3.13043 2.84906 3.74883 1.73692 4.84959C0.624791 5.95035 0 7.44329 0 9C0 10.5567 0.624791 12.0497 1.73692 13.1504C2.84906 14.2512 4.35744 14.8696 5.93023 14.8696H20.1628C20.4773 14.8696 20.779 14.7459 21.0014 14.5257C21.2239 14.3056 21.3488 14.007 21.3488 13.6956V4.30435C21.3488 3.993 21.2239 3.69442 21.0014 3.47426C20.779 3.25411 20.4773 3.13043 20.1628 3.13043Z" fill="#FCFCFC"/>
    <Path d="M24.907 18C29.9289 18 34 13.9706 34 9C34 4.02944 29.9289 0 24.907 0C19.885 0 15.814 4.02944 15.814 9C15.814 13.9706 19.885 18 24.907 18Z" fill="#1777CF"/>
    <Path d="M28.7814 8.06087L24.0372 4.53913C23.861 4.40832 23.6515 4.32867 23.4321 4.30909C23.2127 4.28951 22.9922 4.33078 22.7952 4.42828C22.5982 4.52578 22.4325 4.67565 22.3167 4.8611C22.2009 5.04655 22.1395 5.26025 22.1395 5.47826V12.5217C22.1395 12.7397 22.2009 12.9535 22.3167 13.1389C22.4325 13.3244 22.5982 13.4742 22.7952 13.5717C22.9922 13.6692 23.2127 13.7105 23.4321 13.6909C23.6515 13.6713 23.861 13.5917 24.0372 13.4609L28.7814 9.93913C28.9287 9.82978 29.0483 9.68799 29.1306 9.52499C29.2129 9.36199 29.2558 9.18224 29.2558 9C29.2558 8.81776 29.2129 8.63801 29.1306 8.47501C29.0483 8.31201 28.9287 8.17022 28.7814 8.06087Z" fill="#FCFCFC"/>
  </Svg>
);

const AutoPlayOffSvg = () => (
  <Svg width="34" height="18" viewBox="0 0 34 18" fill="none">
    <Path d="M13.8372 3.13043H28.0698C29.6426 3.13043 31.1509 3.74883 32.2631 4.84959C33.3752 5.95035 34 7.44329 34 9C34 10.5567 33.3752 12.0497 32.2631 13.1504C31.1509 14.2512 29.6426 14.8696 28.0698 14.8696H13.8372C13.5227 14.8696 13.221 14.7459 12.9986 14.5257C12.7761 14.3056 12.6512 14.007 12.6512 13.6956V4.30435C12.6512 3.993 12.7761 3.69442 12.9986 3.47426C13.221 3.25411 13.5227 3.13043 13.8372 3.13043Z" fill="#91929E"/>
    <Path d="M9.09302 18C4.07109 18 0 13.9706 0 9C0 4.02944 4.07109 0 9.09302 0C14.115 0 18.186 4.02944 18.186 9C18.186 13.9706 14.115 18 9.09302 18Z" fill="#F4F4F4"/>
    <Path d="M5.2186 8.06087L9.96279 4.53913C10.139 4.40832 10.3485 4.32867 10.5679 4.30909C10.7873 4.28951 11.0078 4.33078 11.2048 4.42828C11.4018 4.52578 11.5675 4.67565 11.6833 4.8611C11.7991 5.04655 11.8605 5.26025 11.8605 5.47826V12.5217C11.8605 12.7397 11.7991 12.9535 11.6833 13.1389C11.5675 13.3244 11.4018 13.4742 11.2048 13.5717C11.0078 13.6692 10.7873 13.7105 10.5679 13.6909C10.3485 13.6713 10.139 13.5917 9.96279 13.4609L5.2186 9.93913C5.0713 9.82978 4.95174 9.68799 4.8694 9.52499C4.78705 9.36199 4.74418 9.18224 4.74418 9C4.74418 8.81776 4.78705 8.63801 4.8694 8.47501C4.95174 8.31201 5.0713 8.17022 5.2186 8.06087Z" fill="#91929E"/>
  </Svg>
);

// Toggle com animação suave entre os SVGs de Ativo/Inativo
const AutoPlayToggle: React.FC<{ isOn: boolean }> = ({ isOn }) => {
  const anim = useRef(new Animated.Value(isOn ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: isOn ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isOn]);
  const offOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  return (
    <View style={{ width: 34, height: 18 }}>
      <Animated.View style={{ position: 'absolute', opacity: anim }}>
        <AutoPlayOnSvg />
      </Animated.View>
      <Animated.View style={{ position: 'absolute', opacity: offOpacity }}>
        <AutoPlayOffSvg />
      </Animated.View>
    </View>
  );
};

interface VideoPlayerScreenProps {
  route?: {
    params?: {
      videoTitle?: string;
      videoDescription?: string;
      initialVideoId?: number;
    };
  };
}

const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({ route }) => {
  console.log('🎬 [ULTRA-DEBUG] VideoPlayerScreen INICIADO');
  console.log('🎬 [ULTRA-DEBUG] Platform.OS:', Platform.OS);
  console.log('🎬 [ULTRA-DEBUG] route.params:', route?.params);
  
  const navigation = useNavigation();
  const videoRef = useRef<Video>(null);
  const webVideoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<number>(() => {
    const p = route?.params?.initialVideoId;
    return typeof p === 'number' && Number.isFinite(p) ? p : 1;
  });
  const [videoDurations, setVideoDurations] = useState<{[key: number]: string}>({});
  const [videoThumbnails, setVideoThumbnails] = useState<{[key: number]: string}>({});
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastWebTimeUpdateRef = useRef<number>(0);
  const autoPlayAttemptedRef = useRef<number | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  // Controle de proporção e dimensões do player para exibir o vídeo inteiro, centralizado e proporcional
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null); // width/height do vídeo
  const [playerHeight, setPlayerHeight] = useState<number>(207);
  const [isPortraitSource, setIsPortraitSource] = useState<boolean>(false);
  const [wrapperWidth, setWrapperWidth] = useState<number>(screenWidth);
  // Flag para iniciar reprodução automática após troca via Próximo/Voltar
  const pendingAutoPlayRef = useRef<boolean>(false);
  
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const progressValue = useRef(new Animated.Value(0)).current;
  // Throttle para seek durante arraste na barra do mini-player
  const lastMiniDragSeekRef = useRef<number>(0);
  const MINI_DRAG_SEEK_THROTTLE_MS = 120;
  // Guarda timestamp da última interação dentro do mini-player (barra/ícones),
  // para evitar que o toque borbulhe e acione o onPress do wrapper
  const miniLastInteractionRef = useRef<number>(0);

  console.log('🎬 [ULTRA-DEBUG] Estados iniciais:', {
    isPlaying,
    videoLoaded,
    videoError,
    activeVideoId
  });

  const activeVideo = videoSources.find(video => video.id === activeVideoId) || videoSources[0];
  const currentIndex = videoSources.findIndex(video => video.id === activeVideoId);
  const isFirstVideo = currentIndex <= 0;
  const isLastVideo = currentIndex >= videoSources.length - 1;

  console.log('🎬 [ULTRA-DEBUG] Vídeo ativo:', {
    activeVideo,
    currentIndex,
    isFirstVideo,
    isLastVideo
  });

  // resolveVideoUri importado de videoLibrary

  const currentVideoUri = resolveVideoUri(activeVideo);
  const currentVideoSource = { uri: currentVideoUri };
  let posterSource: { uri: string } | undefined = undefined;
  if (videoThumbnails[activeVideoId]) {
    posterSource = { uri: videoThumbnails[activeVideoId] };
  } else if (posterModules[activeVideoId]) {
    try {
      const p = Asset.fromModule(posterModules[activeVideoId]);
      posterSource = { uri: p.localUri ?? p.uri };
      console.log(`🎬 [ASSET] Poster fallback para vídeo ${activeVideoId}: ${posterSource.uri}`);
    } catch (e) {
      console.warn(`🎬 [ASSET] Falha ao resolver poster para vídeo ${activeVideoId}`, e);
    }
  }
  
  console.log('🎬 [ULTRA-DEBUG] Fonte do vídeo atual:', {
    currentVideoUri,
    currentVideoSource,
    posterSource
  });
  
  // Pré-carregar assets de vídeo (web/mobile) dentro do componente para evitar erro de hooks
  useEffect(() => {
    (async () => {
      try {
        console.log('🎬 [ASSET] Pré-carregando vídeos…');
        await Asset.loadAsync(Object.values(videoModules));
        console.log('🎬 [ASSET] Pré-carregados com sucesso.');
      } catch (e) {
        console.warn('🎬 [ASSET] Falha ao pré-carregar vídeos:', e);
      }
    })();
  }, []);
  
  const videoTitle = route?.params?.videoTitle || activeVideo.title;
  const videoDescription = route?.params?.videoDescription || activeVideo.title;

  // SOLUÇÃO RADICAL: Função ultra simples para trocar vídeo
  const switchVideo = async (videoId: number) => {
    console.log(`🎬 [DEBUG] Iniciando troca para vídeo ${videoId}`);
    
    // Resetar estados
    setActiveVideoId(videoId);
    setVideoLoaded(false);
    setVideoError(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    
    console.log(`🎬 [DEBUG] Estados resetados para vídeo ${videoId}`);
    
    // Mostrar controles
    showControlsHandler();
    
    console.log(`🎬 [DEBUG] Vídeo ${videoId} carregado com sucesso!`);
  };

  // Ir para vídeo anterior
  const playPreviousVideo = async () => {
    const idx = videoSources.findIndex(v => v.id === activeVideoId);
    if (idx > 0) {
      pendingAutoPlayRef.current = true;
      await switchVideo(videoSources[idx - 1].id);
      // Tentativa imediata de reprodução (gesto do usuário)
      if (Platform.OS === 'web') {
        const tryPlay = () => {
          const el = webVideoRef.current || (typeof document !== 'undefined' ? (document.querySelector('video') as HTMLVideoElement | null) : null);
          if (el) {
            el.muted = isMuted;
            el.play()
              .then(() => {
                setIsPlaying(true);
                setVideoLoaded(true);
                hideControls();
                pendingAutoPlayRef.current = false;
              })
              .catch((e) => {
                console.warn('Autoplay bloqueado, será tentado no onCanPlay/onLoadedData:', e);
              });
          }
        };
        setTimeout(tryPlay, 30);
      } else {
        try {
          await videoRef.current?.setIsMutedAsync?.(isMuted);
          await videoRef.current?.playAsync?.();
          setIsPlaying(true);
          hideControls();
          pendingAutoPlayRef.current = false;
        } catch (e) {
          console.warn('Falha ao iniciar reprodução imediata (mobile), aguardando onLoad:', e);
        }
      }
    } else {
      showControlsHandler();
    }
  };

  // Ir para próximo vídeo
  const playNextVideo = async () => {
    const idx = videoSources.findIndex(v => v.id === activeVideoId);
    if (idx >= 0 && idx < videoSources.length - 1) {
      pendingAutoPlayRef.current = true;
      await switchVideo(videoSources[idx + 1].id);
      // Tentativa imediata de reprodução (gesto do usuário)
      if (Platform.OS === 'web') {
        const tryPlay = () => {
          const el = webVideoRef.current || (typeof document !== 'undefined' ? (document.querySelector('video') as HTMLVideoElement | null) : null);
          if (el) {
            el.muted = isMuted;
            el.play()
              .then(() => {
                setIsPlaying(true);
                setVideoLoaded(true);
                hideControls();
                pendingAutoPlayRef.current = false;
              })
              .catch((e) => {
                console.warn('Autoplay bloqueado, será tentado no onCanPlay/onLoadedData:', e);
              });
          }
        };
        setTimeout(tryPlay, 30);
      } else {
        try {
          await videoRef.current?.setIsMutedAsync?.(isMuted);
          await videoRef.current?.playAsync?.();
          setIsPlaying(true);
          hideControls();
          pendingAutoPlayRef.current = false;
        } catch (e) {
          console.warn('Falha ao iniciar reprodução imediata (mobile), aguardando onLoad:', e);
        }
      }
    } else {
      showControlsHandler();
    }
  };

  // Selecionar vídeo na lista e iniciar reprodução imediatamente
  const handleSelectVideo = async (videoId: number) => {
    await switchVideo(videoId);
    if (isAutoPlay) {
      if (Platform.OS === 'web') {
        const tryPlay = () => {
          const el = webVideoRef.current || (typeof document !== 'undefined' ? (document.querySelector('video') as HTMLVideoElement | null) : null);
          if (el) {
            el.play().then(() => {
              setIsPlaying(true);
              setVideoLoaded(true);
              hideControls();
            }).catch((e) => {
              console.warn('Autoplay bloqueado, toque no botão de play.', e);
              showControlsHandler();
            });
          }
        };
        // Pequeno atraso para garantir que o ref aponte para o novo elemento
        setTimeout(tryPlay, 50);
      } else {
        try {
          await videoRef.current?.playAsync();
          setIsPlaying(true);
          setVideoLoaded(true);
          hideControls();
        } catch (e) {
          console.warn('Falha ao iniciar reprodução (mobile):', e);
        }
      }
    }
  };

  // Função para obter duração do vídeo
  const getVideoDuration = (videoId: number): string => {
    return videoDurations[videoId] || "0:00";
  };

  // Geração de miniatura no Web: captura de frame via <video> + canvas
  const generateThumbnailWeb = async (videoUri: string, width = 96, height = 64): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        const tempVideo = document.createElement('video');
        tempVideo.crossOrigin = 'anonymous';
        (tempVideo as any).preload = 'metadata';
        (tempVideo as any).playsInline = true;
        tempVideo.muted = true;
        tempVideo.src = videoUri;

        const onError = () => {
          cleanup();
          resolve(null);
        };
        const onLoadedData = () => {
          // Buscar um frame próximo de 0.5s para evitar tela preta
          try {
            tempVideo.currentTime = Math.min(0.5, Math.max(0, tempVideo.duration ? Math.min(0.5, tempVideo.duration - 0.1) : 0.5));
          } catch {
            // Caso não permita seek imediato, tentar no próximo tick
            setTimeout(() => {
              try { tempVideo.currentTime = 0.5; } catch {}
            }, 50);
          }
        };
        const onSeeked = () => {
          const naturalW = tempVideo.videoWidth || 320;
          const naturalH = tempVideo.videoHeight || 180;
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { cleanup(); resolve(null); return; }
          // object-fit: cover
          const scale = Math.max(width / naturalW, height / naturalH);
          const drawW = naturalW * scale;
          const drawH = naturalH * scale;
          const dx = (width - drawW) / 2;
          const dy = (height - drawH) / 2;
          ctx.drawImage(tempVideo, dx, dy, drawW, drawH);
          const dataUrl = canvas.toDataURL('image/png');
          cleanup();
          resolve(dataUrl);
        };
        const cleanup = () => {
          tempVideo.removeEventListener('error', onError);
          tempVideo.removeEventListener('loadeddata', onLoadedData);
          tempVideo.removeEventListener('seeked', onSeeked);
        };
        tempVideo.addEventListener('error', onError);
        tempVideo.addEventListener('loadeddata', onLoadedData);
        tempVideo.addEventListener('seeked', onSeeked);
      } catch (e) {
        resolve(null);
      }
    });
  };

  // Geração de miniatura multiplataforma com fallback
  const generateThumbnail = async (videoId: number, videoUri: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        const thumb = await generateThumbnailWeb(videoUri);
        if (thumb) return thumb;
      } else {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, { time: 1000, quality: 0.7 });
        if (uri) return uri;
      }
    } catch (e) {
      console.warn(`Falha ao gerar thumbnail para vídeo ${videoId}:`, e);
    }
    // Fallback para imagens estáticas do pacote
    const fallbackStatic: { [key: number]: string } = {
      1: Asset.fromModule(require('../../../assets/00001.png')).uri,
      2: Asset.fromModule(require('../../../assets/00002.png')).uri,
      3: Asset.fromModule(require('../../../assets/00003.png')).uri,
      4: Asset.fromModule(require('../../../assets/00001.png')).uri,
      5: Asset.fromModule(require('../../../assets/00002.png')).uri,
      6: Asset.fromModule(require('../../../assets/00003.png')).uri,
    };
    return fallbackStatic[videoId] || null;
  };

  useEffect(() => {
    // Limpar timeout anterior se existir
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }

    // Se o vídeo estiver pausado, sempre mostrar controles
    if (!isPlaying) {
      showControlsHandler();
      return;
    }

    // Se o vídeo estiver reproduzindo, ocultar controles após 2 segundos
    if (isPlaying && showControls) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        hideControls();
      }, 2000);
    }

    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
        hideControlsTimeoutRef.current = null;
      }
    };
  }, [showControls, isPlaying]);

  // useEffect para gerar miniaturas dos vídeos
  useEffect(() => {
    const generateAllThumbnails = async () => {
      const thumbnails: {[key: number]: string} = {};
      
      for (const video of videoSources) {
        const videoUri = resolveVideoUri(video);
        const thumbnail = await generateThumbnail(video.id, videoUri);
        if (thumbnail) {
          thumbnails[video.id] = thumbnail;
        }
      }
      
      setVideoThumbnails(thumbnails);
    };

    generateAllThumbnails();
  }, []);



  // useEffect para carregar durações dos vídeos
  useEffect(() => {
    const loadVideoDurations = async () => {
      const durations: {[key: number]: string} = {};
      
      for (const video of videoSources) {
        try {
          // Criar um elemento de vídeo temporário para obter a duração
          if (Platform.OS === 'web') {
            const tempVideo = document.createElement('video');
            (tempVideo as any).preload = 'metadata';
            (tempVideo as any).playsInline = true;
            tempVideo.muted = true;
            tempVideo.src = resolveVideoUri(video);

            await new Promise((resolve) => {
              let done = false;
              const finish = () => {
                if (done) return;
                const d = tempVideo.duration;
                if (Number.isFinite(d) && d > 0) {
                  const minutes = Math.floor(d / 60);
                  const seconds = Math.floor(d % 60);
                  durations[video.id] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                } else {
                  durations[video.id] = durations[video.id] || "0:00";
                }
                done = true;
                cleanup();
                resolve(true);
              };
              const checkAndFinish = () => {
                const d = tempVideo.duration;
                if (Number.isFinite(d) && d > 0) finish();
              };
              const onError = () => {
                durations[video.id] = "0:00";
                finish();
              };
              const cleanup = () => {
                tempVideo.removeEventListener('loadedmetadata', onLoadedMetadata);
                tempVideo.removeEventListener('durationchange', onDurationChange);
                tempVideo.removeEventListener('canplay', onCanPlay);
                tempVideo.removeEventListener('error', onError);
              };
              const onLoadedMetadata = () => checkAndFinish();
              const onDurationChange = () => checkAndFinish();
              const onCanPlay = () => checkAndFinish();
              tempVideo.addEventListener('loadedmetadata', onLoadedMetadata);
              tempVideo.addEventListener('durationchange', onDurationChange);
              tempVideo.addEventListener('canplay', onCanPlay);
              tempVideo.addEventListener('error', onError);
              // Timeout de segurança para casos em que o moov está no final
              setTimeout(() => finish(), 3500);
            });
          } else {
            // Mobile: tentar resolver a URI e deixar duração desconhecida caso não seja possível.
            // Opcionalmente, poderíamos carregar temporariamente, mas evita custo/performance.
            durations[video.id] = durations[video.id] || "0:00";
          }
        } catch (error) {
          console.error(`Erro ao carregar duração do vídeo ${video.id}:`, error);
          durations[video.id] = "0:00";
        }
      }
      
      setVideoDurations(durations);
    };

    loadVideoDurations();
  }, []);

  const hideControls = () => {
    setShowControls(false);
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const showControlsHandler = () => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const onPlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    const loaded = 'isLoaded' in playbackStatus && playbackStatus.isLoaded;
    console.log('🎬 [DEBUG] onPlaybackStatusUpdate chamado:', {
      'playbackStatus.isLoaded': loaded,
      'playbackStatus.isPlaying': loaded ? (playbackStatus as any).isPlaying : undefined,
      activeVideoId,
      isAutoPlay,
      isLastVideo
    });

    setStatus(playbackStatus);

    if (loaded) {
      console.log('🎬 [DEBUG] Vídeo carregado - atualizando estados:', {
        'positionMillis': (playbackStatus as any).positionMillis,
        'durationMillis': (playbackStatus as any).durationMillis,
        'isPlaying': (playbackStatus as any).isPlaying
      });

      setCurrentTime((playbackStatus as any).positionMillis || 0);
      setDuration((playbackStatus as any).durationMillis || 0);
      setIsPlaying((playbackStatus as any).isPlaying);

      // Auto play para o próximo vídeo ao finalizar
      if ((playbackStatus as any).didJustFinish) {
        console.log('🎬 [DEBUG] Vídeo finalizado - verificando auto-play:', {
          activeVideoId,
          isAutoPlay,
          isLastVideo,
          'próxima ação': isAutoPlay && !isLastVideo ? 'reproduzir próximo' : 'mostrar controles'
        });
        
        setIsPlaying(false);
        if (isAutoPlay && !isLastVideo) {
          console.log('🎬 [DEBUG] Iniciando reprodução do próximo vídeo...');
          playNextVideo();
        } else {
          console.log('🎬 [DEBUG] Mostrando controles (fim da playlist ou auto-play desabilitado)');
          showControlsHandler();
        }
      }
      
      if (playbackStatus.durationMillis && playbackStatus.positionMillis) {
        const progress = playbackStatus.positionMillis / playbackStatus.durationMillis;
        console.log('🎬 [DEBUG] Atualizando progresso:', {
          'positionMillis': playbackStatus.positionMillis,
          'durationMillis': playbackStatus.durationMillis,
          'progress': progress
        });
        progressValue.setValue(progress);
      }
    } else {
      console.log('🎬 [DEBUG] Vídeo não carregado:', {
        'erro': (playbackStatus as any).error,
        activeVideoId,
        currentVideoUri
      });
      
      if ((playbackStatus as any).error) {
        console.error('🎬 [DEBUG] Erro detalhado do vídeo:', {
          'erro completo': (playbackStatus as any).error,
          'activeVideoId': activeVideoId,
          'currentVideoUri': currentVideoUri
        });
        setVideoError('Erro ao carregar vídeo: ' + JSON.stringify((playbackStatus as any).error));
      }
    }
  };

  const togglePlayPause = async () => {
    // Único caminho (Web + Mobile) via expo-av, acionado por interação do usuário
    if (videoRef.current) {
      try {
        if (isPlaying) {
          // Pausa imediata, com fallback para Web
          if (Platform.OS === 'web') {
            const videoElement = typeof document !== 'undefined' ? (document.querySelector('video') as any) : null;
            if (videoElement) {
              try { videoElement.pause(); }
              catch (e) { await videoRef.current.pauseAsync(); }
            } else {
              await videoRef.current.pauseAsync();
            }
          } else {
            await videoRef.current.pauseAsync();
          }
          setIsPlaying(false);
          showControlsHandler();
        } else {
          // Garantir início imediato da reprodução (especialmente no Web)
          if (Platform.OS === 'web') {
            const videoElement = document.querySelector('video') as HTMLVideoElement | null;
            if (videoElement) {
              try {
                await videoElement.play();
              } catch (e) {
                await videoRef.current.playAsync();
              }
            } else {
              await videoRef.current.playAsync();
            }
          } else {
            await videoRef.current.playAsync();
          }
          setIsPlaying(true);
          hideControls();
        }
      } catch (error) {
        console.warn('Falha ao alternar play/pause:', error);
        showControlsHandler();
      }
    } else {
      console.error('🎬 [DEBUG] videoRef.current é null!');
    }
  };

  // Toggle exclusivo para o mini-player: não expande, apenas alterna reprodução
  const toggleMiniPlayPause = async () => {
    if (!videoRef.current) return;
    try {
      if (isPlaying) {
        // Pausa imediata com fallback web
        if (Platform.OS === 'web') {
          const el = typeof document !== 'undefined' ? (document.querySelector('video') as HTMLVideoElement | null) : null;
          if (el) {
            try { el.pause(); } catch { await videoRef.current.pauseAsync?.(); }
          } else {
            await videoRef.current.pauseAsync?.();
          }
        } else {
          await videoRef.current.pauseAsync?.();
        }
        setIsPlaying(false);
      } else {
        // Play imediato com fallback web
        if (Platform.OS === 'web') {
          const el = typeof document !== 'undefined' ? (document.querySelector('video') as HTMLVideoElement | null) : null;
          if (el) {
            try { await el.play(); } catch { await videoRef.current.playAsync?.(); }
          } else {
            await videoRef.current.playAsync?.();
          }
        } else {
          await videoRef.current.playAsync?.();
        }
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('Falha ao alternar play/pause no mini-player:', e);
    }
  };

  const seekBackward = async () => {
    if (videoRef.current && status?.isLoaded) {
      try {
        const newPosition = Math.max(0, currentTime - 10000);
        await setPositionWebSafe(newPosition);
      } catch (error) {
        console.error('Error seeking backward:', error);
      }
    }
  };

  const seekForward = async () => {
    if (videoRef.current && status?.isLoaded) {
      try {
        const newPosition = Math.min(duration, currentTime + 10000);
        await setPositionWebSafe(newPosition);
      } catch (error) {
        console.error('Error seeking forward:', error);
      }
    }
  };

  const toggleFullscreen = async () => {
    if (Platform.OS === 'web') {
      // For web, we can use the Fullscreen API
      try {
        const videoElement = document.querySelector('video');
        if (videoElement) {
          if (!document.fullscreenElement) {
            await videoElement.requestFullscreen();
            setIsFullscreen(true);
          } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
          }
        }
      } catch (error) {
        console.log('Fullscreen not supported on this browser:', error);
        setIsFullscreen(!isFullscreen);
      }
    } else {
      // For native platforms
      try {
        if (isFullscreen) {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        }
        setIsFullscreen(!isFullscreen);
      } catch (error) {
        console.log('Screen orientation not supported:', error);
      }
    }
  };

  const toggleMute = async () => {
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper: posicionamento seguro no Web/Mobile durante seek
  const setPositionWebSafe = async (millis: number) => {
    try {
      const api: any = videoRef.current as any;
      // Preferir API setPositionAsync quando disponível (mobile e stub web)
      if (api?.setPositionAsync) {
        await api.setPositionAsync(millis);
        return;
      }
      // Web: fallback direto no elemento <video>
      if (Platform.OS === 'web') {
        const el = (webVideoRef.current || (typeof document !== 'undefined' ? (document.querySelector('video') as HTMLVideoElement | null) : null));
        if (el) {
          el.currentTime = Math.max(0, Math.floor(millis) / 1000);
          return;
        }
      }
      // Fallback genérico via setStatusAsync (algumas plataformas)
      if (api?.setStatusAsync) {
        await api.setStatusAsync({ positionMillis: Math.floor(millis) });
      }
    } catch (error) {
      console.error('Error setting position:', error);
    }
  };

  const handleProgressBarPress = async (event: any) => {
    if (videoRef.current && duration > 0) {
      const { locationX } = event.nativeEvent;
      const progressBarWidth = screenWidth - 14;
      const progress = locationX / progressBarWidth;
      const newPosition = progress * duration;
      await setPositionWebSafe(newPosition);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      showControlsHandler();
    },
    onPanResponderMove: (evt, gestureState) => {
      if (duration > 0) {
        const progressBarWidth = screenWidth - 14;
        const progress = Math.max(0, Math.min(1, gestureState.moveX / progressBarWidth));
        progressValue.setValue(progress);
      }
    },
    onPanResponderRelease: async (evt, gestureState) => {
      if (videoRef.current && duration > 0) {
        const progressBarWidth = screenWidth - 14;
        const progress = Math.max(0, Math.min(1, gestureState.moveX / progressBarWidth));
        const newPosition = progress * duration;
        await setPositionWebSafe(newPosition);
      }
    },
  });

  // Dimensões responsivas para o mini-player (16:9 aprox.)
  const miniContainerStyle = React.useMemo(() => {
    const w = Math.min(260, Math.floor(screenWidth * 0.55));
    const h = Math.floor(w * 0.56);
    return { width: w, height: h } as const;
  }, [screenWidth]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.statusBarArea} />
      
      <View style={styles.mainContent}>
        <View style={[
          styles.videoContainer,
          isMinimized && [styles.miniPlayerContainer, miniContainerStyle]
        ]}>
          <TouchableOpacity 
            style={[
              styles.videoWrapper,
              { height: playerHeight, alignItems: 'center', justifyContent: 'center' },
              isMinimized && styles.miniPlayerWrapper
            ]}
            onLayout={(e) => {
              const w = e?.nativeEvent?.layout?.width;
              if (typeof w === 'number' && w > 0) {
                setWrapperWidth(w);
              }
            }}
            onPress={async () => {
              // No modo minimizado, qualquer toque expande o player
              if (isMinimized) {
                const now = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
                // Se houve interação recente na barra/ícones do mini-player, não expandir
                if (now - miniLastInteractionRef.current < 350) {
                  console.log('🛡️ [MINI-GUARD] Ignorando toque no wrapper por interação recente no mini-player');
                  return;
                }
                setIsMinimized(false);
                showControlsHandler();
                return;
              }
              // Se o vídeo estiver pausado, sempre mostrar controles
              if (!isPlaying) {
                showControlsHandler();
              } else {
                // Se o vídeo estiver reproduzindo, fazer toggle dos controles
                if (showControls) {
                  hideControls();
                } else {
                  showControlsHandler();
                }
              }
            }}
            activeOpacity={1}
          >
          {Platform.OS === 'web' ? (
            // Web: HTML5 video estabilizado
            <video
              key={`video-web-${activeVideoId}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: isPortraitSource ? 'contain' : 'cover',
                backgroundColor: '#000'
              }}
              src={currentVideoSource.uri}
              controls={false}
              muted={isMuted}
              playsInline
              preload="auto"
              poster={videoThumbnails[activeVideoId] || undefined}
              onLoadStart={() => {
                console.log(`🎬 [ULTRA-DEBUG] Iniciando carregamento do vídeo ${activeVideoId}`);
                console.log(`🎬 [ULTRA-DEBUG] URI: ${currentVideoSource.uri}`);
              }}
              onLoadedMetadata={(e: any) => {
                console.log(`🎬 [ULTRA-DEBUG] Metadados carregados para vídeo ${activeVideoId}`);
                const video = e.target as HTMLVideoElement;
                console.log(`🎬 [ULTRA-DEBUG] Duração: ${video.duration}s`);
                setDuration(video.duration * 1000);
                const vw = (video as any).videoWidth;
                const vh = (video as any).videoHeight;
                if (typeof vw === 'number' && typeof vh === 'number' && vw > 0 && vh > 0) {
                  const portrait = vh > vw;
                  setIsPortraitSource(portrait);
                  console.log(`🎬 [ULTRA-DEBUG] Dimensões nativas: ${vw}x${vh} → portrait=${portrait}`);
                }
              }}
              onLoadedData={(e: any) => {
                console.log(`🎬 [ULTRA-DEBUG] Dados carregados para vídeo ${activeVideoId}`);
                setVideoLoaded(true);
                setVideoError(null);
                // Auto-play pós-carregamento se houver troca via Próximo/Voltar
                if (pendingAutoPlayRef.current) {
                  const el = webVideoRef.current || (e?.target as HTMLVideoElement | null);
                  if (el) {
                    el.muted = isMuted;
                    el.play().then(() => {
                      setIsPlaying(true);
                      hideControls();
                      pendingAutoPlayRef.current = false;
                    }).catch((err) => {
                      console.warn('Autoplay ainda bloqueado em onLoadedData, usuário deve tocar play:', err);
                      showControlsHandler();
                    });
                  }
                }
              }}
              onCanPlay={() => {
                console.log(`🎬 [ULTRA-DEBUG] Vídeo ${activeVideoId} pronto para reprodução`);
                // Fallback: tentar tocar caso onLoadedData não tenha acionado
                if (pendingAutoPlayRef.current) {
                  const el = webVideoRef.current;
                  if (el) {
                    el.muted = isMuted;
                    el.play().then(() => {
                      setIsPlaying(true);
                      hideControls();
                      pendingAutoPlayRef.current = false;
                    }).catch((err) => {
                      console.warn('Autoplay bloqueado em onCanPlay:', err);
                      showControlsHandler();
                    });
                  }
                }
              }}
              onError={(err: any) => {
                console.error(`🎬 [ULTRA-DEBUG] ERRO no vídeo ${activeVideoId}:`, err);
                console.error(`🎬 [ULTRA-DEBUG] URI que falhou: ${currentVideoSource.uri}`);
                setVideoError(`Erro ao carregar vídeo ${activeVideoId}`);
                setVideoLoaded(false);
              }}
              onTimeUpdate={(e: any) => {
                const video = e.target;
                const now = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
                if (now - lastWebTimeUpdateRef.current >= 250) {
                  const ct = video.currentTime * 1000;
                  setCurrentTime(ct);
                  if (video.duration && !isNaN(video.duration)) {
                    const dur = video.duration * 1000;
                    setDuration(dur);
                    const progress = dur > 0 ? ct / dur : 0;
                    progressValue.setValue(progress);
                  }
                  lastWebTimeUpdateRef.current = now;
                }
              }}
              onPlay={() => {
                console.log(`🎬 [ULTRA-DEBUG] Vídeo ${activeVideoId} iniciou reprodução`);
                setIsPlaying(true);
              }}
              onPause={() => {
                console.log(`🎬 [ULTRA-DEBUG] Vídeo ${activeVideoId} pausado`);
                setIsPlaying(false);
              }}
              onEnded={() => {
                console.log(`🎬 [ULTRA-DEBUG] Vídeo ${activeVideoId} terminou`);
                setIsPlaying(false);
              }}
              ref={(el: any) => {
                console.log(`🎬 [ULTRA-DEBUG] Ref do vídeo ${activeVideoId} definida:`, !!el);
                if (el) {
                  webVideoRef.current = el;
                  (videoRef as any).current = {
                    playAsync: async () => {
                      console.log(`🎬 [ULTRA-DEBUG] playAsync chamado para vídeo ${activeVideoId}`);
                      try {
                        await el.play();
                        console.log(`🎬 [ULTRA-DEBUG] playAsync bem-sucedido para vídeo ${activeVideoId}`);
                      } catch (error) {
                        console.error(`🎬 [ULTRA-DEBUG] Erro em playAsync para vídeo ${activeVideoId}:`, error);
                      }
                    },
                    pauseAsync: async () => {
                      console.log(`🎬 [ULTRA-DEBUG] pauseAsync chamado para vídeo ${activeVideoId}`);
                      el.pause();
                    },
                    setPositionAsync: (position: number) => {
                      console.log(`🎬 [ULTRA-DEBUG] setPositionAsync chamado: ${position}ms`);
                      el.currentTime = position / 1000;
                    },
                    setIsMutedAsync: (muted: boolean) => {
                      console.log(`🎬 [ULTRA-DEBUG] setIsMutedAsync chamado: ${muted}`);
                      el.muted = muted;
                    }
                  };
                }
              }}
            />
          ) : (
            // Mobile: manter Video do Expo
            <Video
              key={activeVideoId}
              ref={videoRef}
              style={styles.video}
              source={currentVideoSource}
              usePoster={false}
              useNativeControls={false}
              resizeMode={isPortraitSource ? ResizeMode.CONTAIN : ResizeMode.COVER}
              isLooping={false}
              shouldPlay={false}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              onReadyForDisplay={(event: any) => {
                console.log(`[RADICAL] Vídeo ${activeVideoId} pronto para exibição`);
                const ns = event?.naturalSize;
                if (ns && typeof ns.width === 'number' && typeof ns.height === 'number') {
                  const portrait = ns.height > ns.width;
                  setIsPortraitSource(portrait);
                  console.log(`🎬 [ULTRA-DEBUG] naturalSize: ${ns.width}x${ns.height} → portrait=${portrait}`);
                }
                setVideoLoaded(true);
                setVideoError(null);
                // Auto-play pós-carregamento (mobile) se troca foi via Próximo/Voltar
                if (pendingAutoPlayRef.current) {
                  (async () => {
                    try {
                      await videoRef.current?.setIsMutedAsync?.(isMuted);
                      await videoRef.current?.playAsync?.();
                      setIsPlaying(true);
                      hideControls();
                      pendingAutoPlayRef.current = false;
                    } catch (err) {
                      console.warn('Autoplay falhou em onReadyForDisplay (mobile):', err);
                      showControlsHandler();
                    }
                  })();
                }
              }}
              onLoad={() => {
                console.log(`[RADICAL] Vídeo ${activeVideoId} carregado`);
                setVideoLoaded(true);
                setVideoError(null);
                // Redundância: tentar auto-play também em onLoad (mobile)
                if (pendingAutoPlayRef.current) {
                  (async () => {
                    try {
                      await videoRef.current?.setIsMutedAsync?.(isMuted);
                      await videoRef.current?.playAsync?.();
                      setIsPlaying(true);
                      hideControls();
                      pendingAutoPlayRef.current = false;
                    } catch (err) {
                      console.warn('Autoplay falhou em onLoad (mobile):', err);
                      showControlsHandler();
                    }
                  })();
                }
              }}
              onError={(err: any) => {
                console.log(`[RADICAL] Erro no vídeo ${activeVideoId}:`, err);
                setVideoError('Erro ao carregar vídeo');
              }}
            />
          )}

          {/* Removido poster/placeholder para evitar qualquer sobreposição visual */}

            {videoError && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                <Text style={styles.errorText}>{videoError}</Text>
                <Text style={styles.errorSubText}>Verifique sua conexão e tente novamente</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={async () => {
                    setVideoError(null);
                    setVideoLoaded(false);
                    // Recarregar o vídeo atual com URI resolvida
                    if (Platform.OS === 'web') {
                      try {
                        const videoElement = document.querySelector('video') as HTMLVideoElement | null;
                        if (videoElement) {
                          const tryPlay = () => {
                            videoElement.play().then(() => {
                              setIsPlaying(true);
                              setVideoLoaded(true);
                            }).catch((e) => {
                              console.warn('Autoplay bloqueado, usuário deve tocar play:', e);
                              showControlsHandler();
                            });
                          };
                          if (videoElement.readyState >= 3) {
                            tryPlay();
                          } else {
                            const onCanPlay = () => {
                              videoElement.removeEventListener('canplay', onCanPlay);
                              tryPlay();
                            };
                            videoElement.addEventListener('canplay', onCanPlay);
                          }
                        }
                      } catch (e) {
                        console.error('Erro ao tentar novamente no web:', e);
                      }
                    } else if (videoRef.current) {
                      const retryUri = currentVideoUri;
                      videoRef.current.unloadAsync().then(async () => {
                        try {
                          await videoRef.current?.loadAsync({ uri: retryUri }, {
                            shouldPlay: true,
                            positionMillis: 0,
                            volume: isMuted ? 0 : 1,
                          });
                          setIsPlaying(true);
                          setVideoLoaded(true);
                        } catch (e) {
                          console.error('Erro ao recarregar vídeo:', e);
                          setVideoError('Erro ao carregar o vídeo novamente');
                        }
                      });
                    }
                  }}
                >
                  <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
              </View>
            )}

            <Animated.View style={[
              styles.controlsOverlay,
              // No modo minimizado, manter controles sempre visíveis
              { opacity: isMinimized ? 1 : (controlsOpacity as any) }
            ]}>
              <View style={styles.topControls}>
                {isMinimized ? (
                  <>
                    <TouchableOpacity
                      onPressIn={() => { miniLastInteractionRef.current = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now(); }}
                      onPress={toggleMiniPlayPause}
                      style={[styles.miniPlayButton, isPlaying && styles.miniIconNoBg]}
                    >
                      <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color="#FCFCFC" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={async () => {
                        // Fechar mini janela
                        try { await videoRef.current?.pauseAsync(); } catch {}
                        setIsPlaying(false);
                        setIsMinimized(false);
                        showControlsHandler();
                      }}
                      onPressIn={() => { miniLastInteractionRef.current = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now(); }}
                      style={[styles.miniCloseButton, isPlaying && styles.miniIconNoBg]}
                    >
                      <Ionicons name="close" size={18} color="#FCFCFC" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={async () => {
                        // Minimiza sem trocar de tela, mantendo reprodução e estado
                        const minimizing = !isMinimized;
                        setIsMinimized(minimizing);
                        if (!minimizing) {
                          showControlsHandler();
                        }
                      }}
                      style={styles.closeButton}
                    >
                      <Ionicons name="chevron-down" size={20} color="#FCFCFC" />
                    </TouchableOpacity>
                    <View style={styles.iconsBg}>
                      <View style={styles.iconsContainer}>
                        <TouchableOpacity onPress={() => setIsAutoPlay(prev => !prev)}>
                          <AutoPlayToggle isOn={isAutoPlay} />
                        </TouchableOpacity>
                        <ConfigIcon />
                      </View>
                    </View>
                  </>
                )}
              </View>

              <View style={styles.centerControls}>
                {!isMinimized && (
                  <TouchableOpacity onPress={playPreviousVideo} disabled={isFirstVideo} style={[styles.controlButton, isFirstVideo && styles.disabledButton]}>
                    <Ionicons name="play-skip-back" size={25} color="#FCFCFC" />
                  </TouchableOpacity>
                )}
                
                {!isMinimized && (
                  <TouchableOpacity 
                    onPress={() => {
                      togglePlayPause();
                    }} 
                    style={styles.playButton}
                  >
                    <Ionicons 
                      name={isPlaying ? "pause" : "play"} 
                      size={35} 
                      color="#FCFCFC" 
                    />
                  </TouchableOpacity>
                )}
                
                {!isMinimized && (
                  <TouchableOpacity onPress={playNextVideo} disabled={isLastVideo} style={[styles.controlButton, isLastVideo && styles.disabledButton]}>
                    <Ionicons name="play-skip-forward" size={25} color="#FCFCFC" />
                  </TouchableOpacity>
                )}
              </View>

              {!isMinimized && (
                <View style={styles.bottomControls}>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>
                      <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
                      <Text style={styles.totalTime}>/ {formatTime(duration)}</Text>
                    </Text>
                  </View>
                  
                  <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenButton}>
                    <MaterialIcons name="fullscreen" size={25} color="#FCFCFC" />
                  </TouchableOpacity>
                </View>
              )}
              {isMinimized && (
                <View
                  style={styles.miniProgressOverlay}
                  onStartShouldSetResponder={() => true}
                  onStartShouldSetResponderCapture={() => true}
                  onResponderGrant={async (event) => {
                    const { locationX } = event.nativeEvent as any;
                    const effectiveWidth = Math.max(1, (wrapperWidth || 0) - 20);
                    const progress = Math.max(0, Math.min(1, locationX / effectiveWidth));
                    progressValue.setValue(progress);
                    miniLastInteractionRef.current = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
                    if (videoRef.current && duration > 0) {
                      const newPosition = progress * duration;
                      await setPositionWebSafe(newPosition);
                      setCurrentTime(newPosition);
                    }
                  }}
                  onResponderMove={(event) => {
                    const { locationX } = event.nativeEvent as any;
                    const effectiveWidth = Math.max(1, (wrapperWidth || 0) - 20);
                    const progress = Math.max(0, Math.min(1, locationX / effectiveWidth));
                    progressValue.setValue(progress);
                    // Atualização de tempo em tempo real durante o arraste (somente mini-player)
                    const now = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
                    miniLastInteractionRef.current = now;
                    if (videoRef.current && duration > 0 && (now - lastMiniDragSeekRef.current) >= MINI_DRAG_SEEK_THROTTLE_MS) {
                      const newPosition = progress * duration;
                      // Atualiza posição do player e o estado de tempo para refletir de imediato
                      setPositionWebSafe(newPosition).catch(() => {});
                      setCurrentTime(newPosition);
                      lastMiniDragSeekRef.current = now;
                    }
                  }}
                  onResponderRelease={async (event) => {
                    const { locationX } = event.nativeEvent as any;
                    const effectiveWidth = Math.max(1, (wrapperWidth || 0) - 20);
                    const progress = Math.max(0, Math.min(1, locationX / effectiveWidth));
                    if (videoRef.current && duration > 0) {
                      const newPosition = progress * duration;
                      await setPositionWebSafe(newPosition);
                      setCurrentTime(newPosition);
                    }
                    // Mantém a guarda ativa por breve período após release
                    miniLastInteractionRef.current = (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
                  }}
                >
                  <View style={styles.miniProgressBackground} />
                  <Animated.View 
                    style={[
                      styles.miniProgressFill,
                      {
                        width: progressValue.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                      },
                    ]}
                  />
                  {/* Thumb visível indicando a posição atual */}
                  <Animated.View 
                    style={[
                      styles.miniProgressThumb,
                      {
                        left: progressValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, Math.max(0, (wrapperWidth || 0) - 20 - 12)],
                        }),
                      },
                    ]}
                  />
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>

          {!isMinimized && (
          <View style={styles.progressContainer} {...panResponder.panHandlers}>
            <TouchableOpacity 
              style={styles.progressBar}
              onPress={handleProgressBarPress}
              activeOpacity={1}
            >
              <View style={styles.progressBackground} />
              <Animated.View 
                style={[
                  styles.progressFill,
                  {
                    width: progressValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]} 
              />
              <Animated.View 
                style={[
                  styles.progressThumb,
                  {
                    left: progressValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, screenWidth - 26],
                    }),
                  },
                ]} 
              />
            </TouchableOpacity>
          </View>
          )}
        </View>
        {isMinimized ? (
          // Quando minimizado, exibe a TrainingScreen ao fundo
          <TrainingScreen />
        ) : (
          // Estado normal: mantém descrição e lista de vídeos relacionados
          <>
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{videoDescription}</Text>
            </View>

            <View style={styles.divider} />

            <ScrollView style={styles.relatedVideosContainer} showsVerticalScrollIndicator={false}>
              {videoSources.map((video, index) => (
                <View key={video.id}>
                  <TouchableOpacity 
                    style={[
                      styles.relatedVideoItem,
                      activeVideoId === video.id && styles.relatedVideoItemActive
                    ]}
                    onPress={() => handleSelectVideo(video.id)}
                  >
                    <View style={[
                      styles.relatedVideoThumbnail,
                      activeVideoId === video.id && styles.relatedVideoThumbnailActive
                    ]}>
                      {videoThumbnails[video.id] ? (
                        <Image 
                          source={{ uri: videoThumbnails[video.id] }}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.thumbnailPlaceholder}>
                          <Ionicons name="play" size={16} color="#FCFCFC" />
                        </View>
                      )}
                      <View style={styles.videoDuration}>
                        <Text style={styles.videoDurationText}>{getVideoDuration(video.id)}</Text>
                      </View>
                    </View>
                    <View style={styles.relatedVideoInfo}>
                      <Text style={[
                        styles.relatedVideoTitle,
                        activeVideoId === video.id && styles.relatedVideoTitleActive
                      ]}>{video.title}</Text>
                    </View>
                  </TouchableOpacity>
                  {index < videoSources.length - 1 && <View style={styles.relatedVideoDivider} />}
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  statusBarArea: {
    height: 40,
    backgroundColor: '#FCFCFC',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  videoContainer: {
    position: 'relative',
  },
  videoWrapper: {
    height: 207,
    backgroundColor: '#EDEFF3',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EDEFF3',
  },
  // Removidos estilos de poster/placeholder para evitar duplicidade de renderização
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  closeButton: {
    width: 40,
    height: 25,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  iconsBg: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 5,
  },
  miniCloseButton: {
    width: 25,
    height: 25,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  miniPlayButton: {
    width: 25,
    height: 25,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  // Remover fundo quando o vídeo estiver tocando (ícones ficam só brancos)
  miniIconNoBg: {
    backgroundColor: 'transparent',
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 37,
    gap: 40,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 220,
    height: 124,
    zIndex: 1000,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  miniPlayerWrapper: {
    height: '100%',
  },
  disabledButton: {
    opacity: 0.4,
  },
  timeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginTop: 0,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  currentTime: {
    color: '#FCFCFC',
    paddingRight: 5,
  },
  totalTime: {
    color: '#F4F4F4',
  },
  fullscreenButton: {
    width: 25,
    height: 25,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    height: 0,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  progressBar: {
    height: 4,
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#91929E',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
    backgroundColor: '#1777CF',
  },
  // Barra de progresso interna do mini-player
  miniProgressOverlay: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 8,
    height: 4,
  },
  miniProgressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#91929E',
    opacity: 0.9,
  },
  miniProgressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
    backgroundColor: '#1777CF',
  },
  miniProgressThumb: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1777CF',
    borderWidth: 2,
    borderColor: '#FCFCFC',
    zIndex: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1777CF',
  },
  descriptionContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  descriptionText: {
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 20,
  },
  divider: {
    height: 0.1,
    backgroundColor: '#D8E0F0',
  },
  relatedVideosContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  relatedVideoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 15,
  },
  relatedVideoThumbnail: {
    width: 96,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#00000033',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  playIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 5,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 38,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDurationText: {
    color: '#FCFCFC',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  relatedVideoInfo: {
    flex: 1,
  },
  relatedVideoTitle: {
    fontSize: 14,
    color: '#6F767E',
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  relatedVideoDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 0,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  errorText: {
    color: '#FCFCFC',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubText: {
    color: '#FCFCFC',
    fontSize: 14,
    fontFamily: 'Inter',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1777CF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FCFCFC',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  // Estilos para miniaturas
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#00000033',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Estilos para itens ativos (selecionados) - apenas borda na miniatura e título azul
  relatedVideoItemActive: {
    // Removido fundo azul - apenas o item sem destaque de fundo
  },
  relatedVideoThumbnailActive: {
    borderWidth: 2,
    borderColor: '#1777CF',
  },
  relatedVideoTitleActive: {
    color: '#1777CF',
    fontFamily: 'Inter_400Regular',
  },
});

export default VideoPlayerScreen;