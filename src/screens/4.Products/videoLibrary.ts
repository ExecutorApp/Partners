import { Asset } from 'expo-asset';
import { Platform } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';

// Lista de vídeos de exemplo usados em Treinamento e no Player
export const videoSources = [
  { id: 1, title: 'Protege o patrimônio familiar e empresarial. Facilita sucessão e herança sem litígios.', uri: '/Video01.mp4' },
  { id: 2, title: 'Protege o patrimônio familiar e empresarial. Facilita sucessão e herança sem litígios.', uri: '/Video02.mp4' },
  { id: 3, title: 'Protege o patrimônio familiar e empresarial. Facilita sucessão e herança sem litígios.', uri: '/Video03.mp4' },
  { id: 4, title: 'Protege o patrimônio familiar e empresarial. Facilita sucessão e herança sem litígios.', uri: '/Video04.mp4' },
  { id: 5, title: 'Protege o patrimônio familiar e empresarial. Facilita sucessão e herança sem litígios.', uri: '/Video05.mp4' },
  { id: 6, title: 'Protege o patrimônio familiar e empresarial. Facilita sucessão e herança sem litígios.', uri: '/Video06.mp4' },
];

// Requires estáticos para cada vídeo — garantem path válido e Content-Type correto no Web
export const videoModules: { [key: number]: any } = {
  1: require('../../../assets/Video01.mp4'),
  2: require('../../../assets/Video02.mp4'),
  3: require('../../../assets/Video03.mp4'),
  4: require('../../../assets/Video04.mp4'),
  5: require('../../../assets/Video05.mp4'),
  6: require('../../../assets/Video06.mp4'),
};

// Posters estáticos de fallback para os vídeos
export const posterModules: { [key: number]: any } = {
  1: require('../../../assets/00001.png'),
  2: require('../../../assets/00002.png'),
};

// Resolve a URI do vídeo considerando diferenças Web/Mobile
export const resolveVideoUri = (video: { id?: number; uri?: string }): string => {
  const id = video.id;
  if (id && videoModules[id]) {
    try {
      const asset = Asset.fromModule(videoModules[id]);
      return asset.localUri ?? asset.uri;
    } catch (e) {
      // Fallback para URI bruta
    }
  }
  return video.uri || '';
};

// Pré-carrega os assets de vídeo para evitar atrasos iniciais
export const preloadVideoAssets = async () => {
  try {
    await Asset.loadAsync(Object.values(videoModules));
  } catch {}
};

// Carrega durações dos vídeos (suporte principal no Web)
export const loadVideoDurations = async (): Promise<{ [key: number]: string }> => {
  const durations: { [key: number]: string } = {};
  for (const video of videoSources) {
    try {
      if (Platform.OS === 'web') {
        const tempVideo = document.createElement('video');
        (tempVideo as any).preload = 'metadata';
        (tempVideo as any).playsInline = true;
        tempVideo.muted = true;
        tempVideo.src = resolveVideoUri(video);
        await new Promise<void>((resolve) => {
          const onLoadedMetadata = () => {
            const d = tempVideo.duration;
            if (Number.isFinite(d) && d > 0) {
              const minutes = Math.floor(d / 60);
              const seconds = Math.floor(d % 60);
              durations[video.id] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
              durations[video.id] = durations[video.id] || '0:00';
            }
            cleanup();
            resolve();
          };
          const cleanup = () => {
            tempVideo.removeEventListener('loadedmetadata', onLoadedMetadata);
          };
          tempVideo.addEventListener('loadedmetadata', onLoadedMetadata);
        });
      } else {
        // Mobile: manter 0:00 como fallback (evita custo/performance)
        durations[video.id] = durations[video.id] || '0:00';
      }
    } catch {
      durations[video.id] = '0:00';
    }
  }
  return durations;
};

// === Miniaturas (mesmo algoritmo da VideoPlayerScreen) ===
export const generateThumbnailWeb = async (
  videoUri: string,
  width = 96,
  height = 64
): Promise<string | null> => {
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
        try {
          tempVideo.currentTime = Math.min(
            0.5,
            Math.max(0, tempVideo.duration ? Math.min(0.5, tempVideo.duration - 0.1) : 0.5)
          );
        } catch {
          setTimeout(() => {
            try {
              tempVideo.currentTime = 0.5;
            } catch {}
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
        if (!ctx) {
          cleanup();
          resolve(null);
          return;
        }
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

export const generateThumbnail = async (
  videoId: number,
  videoUri?: string
): Promise<string | null> => {
  try {
    const srcUri = videoUri ?? resolveVideoUri({ id: videoId });
    if (Platform.OS === 'web') {
      const thumb = await generateThumbnailWeb(srcUri);
      if (thumb) return thumb;
    } else {
      const { uri } = await VideoThumbnails.getThumbnailAsync(srcUri, { time: 1000, quality: 0.7 });
      if (uri) return uri;
    }
  } catch (e) {
    console.warn(`Falha ao gerar thumbnail para vídeo ${videoId}:`, e);
  }
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