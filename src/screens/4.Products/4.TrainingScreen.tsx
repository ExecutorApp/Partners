import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Image, Animated, FlatList, Platform, useWindowDimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFonts, Inter_100Thin, Inter_200ExtraLight, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import Svg, { Path } from 'react-native-svg';
import YoutubePlayer from 'react-native-youtube-iframe';
import Header from '../5.Side Menu/2.Header';
import BottomMenu from '../5.Side Menu/3.BottomMenu';
import { Layout } from '../../constants/theme';
import { ScreenNames, RootStackParamList } from '../../types/navigation';
import { videoSources, resolveVideoUri, generateThumbnail, loadVideoDurations } from './videoLibrary';

// Interfaces
interface ProductData {
  id: string;
  title: string;
  commission: string;
  averageTicket: string;
  averageClosingTime: string;
  image?: any;
}

interface TrainingScreenParams {
  product: ProductData;
  miniPlayer?: {
    sourceUri: string;
    title?: string;
    startPositionMillis?: number;
  };
}

type TrainingScreenRouteProp = RouteProp<{ TrainingScreen: TrainingScreenParams }, 'TrainingScreen'>;

// SVG Icons
const PlayIcon = () => (
  <Svg width="9" height="13" viewBox="0 0 9 13" fill="none">
    <Path d="M0 1.5C0 0.671573 0.895431 0.171573 1.5 0.671573L8.5 5.17157C9.16667 5.50824 9.16667 6.49176 8.5 6.82843L1.5 11.3284C0.895431 11.8284 0 11.3284 0 10.5V1.5Z" fill="#1777CF"/>
  </Svg>
);

interface IconProps { color?: string }

const VideoIcon: React.FC<IconProps> = ({ color = '#7D8592' }) => (
  <Svg width="14" height="14" viewBox="0 0 12 12" fill="none">
    <Path d="M0 6C0 4.4087 0.632141 2.88258 1.75736 1.75736C2.88258 0.632141 4.4087 0 6 0C7.5913 0 9.11742 0.632141 10.2426 1.75736C11.3679 2.88258 12 4.4087 12 6C12 7.5913 11.3679 9.11742 10.2426 10.2426C9.11742 11.3679 7.5913 12 6 12C4.4087 12 2.88258 11.3679 1.75736 10.2426C0.632141 9.11742 0 7.5913 0 6ZM4.41328 3.44766C4.23516 3.54609 4.125 3.73594 4.125 3.9375V8.0625C4.125 8.26641 4.23516 8.45391 4.41328 8.55234C4.59141 8.65078 4.80703 8.64844 4.98281 8.54062L8.35781 6.47812C8.52422 6.375 8.62734 6.19453 8.62734 5.99766C8.62734 5.80078 8.52422 5.62031 8.35781 5.51719L4.98281 3.45469C4.80938 3.34922 4.59141 3.34453 4.41328 3.44297V3.44766Z" fill={color}/>
  </Svg>
);

const AudioIcon: React.FC<IconProps> = ({ color = '#7D8592' }) => (
  <Svg width="16" height="13" viewBox="0 0 12 11" fill="none">
    <Path d="M6 1.125C3.51328 1.125 1.4625 2.98594 1.1625 5.39062C1.38281 5.30156 1.62188 5.25 1.875 5.25C2.49609 5.25 3 5.75391 3 6.375V9.375C3 9.99609 2.49609 10.5 1.875 10.5C0.839062 10.5 0 9.66094 0 8.625V8.25V7.125V6C0 2.68594 2.68594 0 6 0C9.31406 0 12 2.68594 12 6V7.125V8.25V8.625C12 9.66094 11.1609 10.5 10.125 10.5C9.50391 10.5 9 9.99609 9 9.375V6.375C9 5.75391 9.50391 5.25 10.125 5.25C10.3781 5.25 10.6172 5.29922 10.8375 5.39062C10.5375 2.98594 8.48672 1.125 6 1.125Z" fill={color}/>
  </Svg>
);

const TrainingScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'TrainingScreen'>>();
  const route = useRoute<TrainingScreenRouteProp>();
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Treinamento');
  const [activeSubTab, setActiveSubTab] = useState('Conteúdo');
  const [activeMediaType, setActiveMediaType] = useState('Vídeos');
  // Mini-player overlay
  const miniVideoRef = useRef<Video>(null);
  const [miniVisible, setMiniVisible] = useState(!!route.params?.miniPlayer?.sourceUri);
  const [miniIsPlaying, setMiniIsPlaying] = useState(false);
  const [miniCurrentTime, setMiniCurrentTime] = useState(0);
  const [miniDuration, setMiniDuration] = useState(0);
  const miniProgress = useRef(new Animated.Value(0)).current;


  // Obter dados do produto dos parâmetros da rota
  const product = route.params?.product || {
    id: '1',
    title: 'Holding Patrimonial',
    commission: '20%',
    averageTicket: 'R$ 10.000',
    averageClosingTime: '30 Dias',
    image: null,
  };

  const [fontsLoaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  // Carregar mini-player quando presente nos params (deve ser chamado antes de qualquer early return)
  useEffect(() => {
    const src = route.params?.miniPlayer?.sourceUri;
    const startPos = route.params?.miniPlayer?.startPositionMillis || 0;
    console.log('[TrainingScreen] mini-player effect', { miniVisible, src, startPos });
    if (miniVisible && src && miniVideoRef.current) {
      (async () => {
        try {
          await miniVideoRef.current?.unloadAsync().catch(() => {});
          await miniVideoRef.current?.loadAsync({ uri: src }, {
            shouldPlay: true,
            positionMillis: startPos,
            progressUpdateIntervalMillis: 100,
          });
          setMiniIsPlaying(true);
        } catch (e) {
          console.warn('[TrainingScreen] Falha ao carregar mini-player:', e);
        }
      })();
    }
    return () => { miniVideoRef.current?.unloadAsync().catch(() => {}); };
  }, [miniVisible, route.params?.miniPlayer?.sourceUri]);

  // Estados para miniaturas e durações reais (devem vir antes de qualquer early return)
  const [videoThumbnails, setVideoThumbnails] = useState<{ [key: number]: string }>({});
  const [videoDurations, setVideoDurations] = useState<{ [key: number]: string }>({});
  // Estados de depuração de layout e conteúdo — manter antes de qualquer retorno condicional
  const [contentLayoutHeight, setContentLayoutHeight] = useState(0);
  const [listContentHeight, setListContentHeight] = useState(0);

  // Plataforma e dimensões (devem estar antes de qualquer retorno condicional)
  const isWeb = Platform.OS === 'web';
  const { height: windowHeight } = useWindowDimensions();
  const [headerHeight, setHeaderHeight] = useState(0);
  const contentHeightWeb = Math.max(windowHeight - Layout.bottomMenuHeight - headerHeight, 0);
  const bottomScrollInset = Layout.bottomMenuHeight;
  useEffect(() => {
    console.log('[TrainingScreen-Debug] mount', { windowHeight, headerHeight, contentHeightWeb, isWeb, bottomScrollInset });
  }, [windowHeight, headerHeight, contentHeightWeb, isWeb]);

  // Gerar miniaturas capturando frame do próprio vídeo (mesmo código do Player)
  useEffect(() => {
    console.log('[TrainingScreen] Generating thumbnails for videos');
    const generateAllThumbnails = async () => {
      const thumbs: { [key: number]: string } = {};
      for (const v of videoSources) {
        const uri = resolveVideoUri(v);
        const t = await generateThumbnail(v.id, uri);
        if (t) thumbs[v.id] = t;
      }
      setVideoThumbnails(thumbs);
    };
    generateAllThumbnails();
  }, []);

  // Carregar durações reais dos vídeos (Web suporta obter com segurança)
  useEffect(() => {
    console.log('[TrainingScreen] Loading real video durations');
    (async () => {
      try {
        const d = await loadVideoDurations();
        setVideoDurations(d);
      } catch {}
    })();
  }, []);

  // Evitar retorno condicional que muda a ordem dos hooks
  // Podemos renderizar mesmo sem fontes e confiar nos estilos padrão

  const onMiniStatusUpdate = (s: AVPlaybackStatus) => {
    if (!('isLoaded' in s) || !s.isLoaded) return;
    const dur = s.durationMillis || 0;
    const pos = s.positionMillis || 0;
    setMiniDuration(dur);
    setMiniCurrentTime(pos);
    setMiniIsPlaying(!!s.isPlaying);
    const p = dur > 0 ? pos / dur : 0;
    miniProgress.setValue(p);
  };

  const toggleMiniPlayPause = async () => {
    try {
      if (!miniVideoRef.current) return;
      if (miniIsPlaying) {
        await miniVideoRef.current.pauseAsync();
        setMiniIsPlaying(false);
      } else {
        await miniVideoRef.current.playAsync();
        setMiniIsPlaying(true);
      }
    } catch (e) {
      // Fallback web: pausar/continuar elemento <video>
      try {
        const el = typeof document !== 'undefined' ? document.querySelector('video') : null;
        if (el) {
          if (miniIsPlaying) (el as any).pause(); else (el as any).play();
          setMiniIsPlaying(!miniIsPlaying);
        }
      } catch {}
    }
  };

  const closeMini = async () => {
    try { await miniVideoRef.current?.stopAsync(); } catch {}
    try { await miniVideoRef.current?.unloadAsync(); } catch {}
    setMiniVisible(false);
    // Limpar params para evitar reabrir ao voltar
    // @ts-ignore
    (navigation as any).setParams({ miniPlayer: undefined });
  };

  const handleBackPress = () => {
    // Ir diretamente para a lista de produtos
    navigation.navigate(ScreenNames.ProductList);
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Apresentação') {
      // Navegação explícita evita o conflito de precisar clicar duas vezes
      navigation.navigate(ScreenNames.PresentationScreen, { product });
    } else if (tab === 'Treinamento') {
      // Já estamos na tela de Treinamento
    } else if (tab === 'Material/Apoio') {
      // Futuro: navegação para Material/Apoio
    }
  };

  const handleSubTabPress = (subTab: string) => {
    setActiveSubTab(subTab);
  };

  const handleMediaTypePress = (mediaType: string) => {
    setActiveMediaType(mediaType);
  };

  interface TrainingVideo {
    id: string;
    title: string;
    duration: string;
  }


  // Constrói a lista de vídeos usando nossa biblioteca compartilhada
  const videoData: TrainingVideo[] = videoSources.map((v) => ({
    id: String(v.id),
    title: v.title,
    duration: videoDurations[v.id] || '0:00',
  }));


  const extractVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const handleVideoPress = (video: TrainingVideo) => {
    navigation.navigate(ScreenNames.VideoPlayerScreen, {
      videoTitle: video.title,
      videoDescription: video.title,
      initialVideoId: Number(video.id),
    });
  };

  // (movido para cima para manter ordem estável de hooks)

  // Header reutilizável para FlatList/ScrollView
  const renderHeader = () => (
    <View style={styles.productInfo}>
      <Text style={styles.productTitle}>{product.title}</Text>

      {/* Tabs principais */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Apresentação' && styles.activeTab]}
          onPress={() => handleTabPress('Apresentação')}
        >
          <Text style={[styles.tabText, activeTab === 'Apresentação' && styles.activeTabText]}
          >
            Apresentação
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Treinamento' && styles.activeTab]}
          onPress={() => handleTabPress('Treinamento')}
        >
          <Text style={[styles.tabText, activeTab === 'Treinamento' && styles.activeTabText]}
          >
            Treinamento
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Material/Apoio' && styles.activeTab]}
          onPress={() => handleTabPress('Material/Apoio')}
        >
          <Text style={[styles.tabText, activeTab === 'Material/Apoio' && styles.activeTabText]}
          >
            Material/Apoio
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub-tabs */}
      <View style={styles.subTabContainer}>
        <TouchableOpacity 
          style={[styles.subTab, activeSubTab === 'Conteúdo' && styles.activeSubTab]}
          onPress={() => handleSubTabPress('Conteúdo')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'Conteúdo' && styles.activeSubTabText]}
          >
            Conteúdo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.subTab, activeSubTab === 'Estratégias' && styles.activeSubTab]}
          onPress={() => handleSubTabPress('Estratégias')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'Estratégias' && styles.activeSubTabText]}
          >
            Estratégias
          </Text>
        </TouchableOpacity>
      </View>

      {/* Linha divisória */}
      <View style={styles.divider} />

      {/* Botões de tipo de mídia */}
      <View style={styles.mediaTypeContainer}>
        <TouchableOpacity 
          style={[styles.mediaTypeButton, activeMediaType === 'Vídeos' && styles.activeMediaTypeButton]}
          onPress={() => handleMediaTypePress('Vídeos')}
        >
          <VideoIcon color={activeMediaType === 'Vídeos' ? '#1777CF' : '#7D8592'} />
          <Text style={[styles.mediaTypeText, activeMediaType === 'Vídeos' && styles.activeMediaTypeText]}
          >
            Vídeos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.mediaTypeButton, activeMediaType === 'Áudios' && styles.activeMediaTypeButton]}
          onPress={() => handleMediaTypePress('Áudios')}
        >
          <AudioIcon color={activeMediaType === 'Áudios' ? '#1777CF' : '#7D8592'} />
          <Text style={[styles.mediaTypeText, activeMediaType === 'Áudios' && styles.activeMediaTypeText]}
          >
            Áudios
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Item de vídeo reutilizável
  const renderVideoCard = (video: TrainingVideo) => (
    <TouchableOpacity key={video.id} style={styles.videoItem} onPress={() => handleVideoPress(video)}>
      <View style={styles.videoThumbnail}>
        {videoThumbnails[Number(video.id)] && (
          <Image
            source={{ uri: videoThumbnails[Number(video.id)] }}
            style={styles.videoThumbnailImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.playButton}>
          <PlayIcon />
        </View>
        <View style={styles.videoDuration}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{video.title}</Text>
      </View>
    </TouchableOpacity>
  );



  return (
    <SafeAreaView style={[
      styles.container,
      // Web: permitir que o conteúdo ultrapasse a viewport e a página role
      isWeb ? ({ minHeight: '100vh' } as any) : undefined,
    ]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFC" />
      
      {/* Header */}
      <View
        style={styles.headerWrapper}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          setHeaderHeight(h);
          console.log('[TrainingScreen-Debug] header height:', h);
        }}
      >
        <Header 
          title={''}
          notificationCount={6}
          onMenuPress={() => setSideMenuVisible(true)}
          showBackButton={false}
        />
        {/* Botão voltar customizado */}
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.customBackButton}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Path d="M10 19L1 10M1 10L10 1M1 10L19 10" stroke="#1777CF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View
        style={[
          styles.content,
          // Web: remover altura fixa e overflow para permitir rolagem natural
          isWeb ? ({ flex: 1, minHeight: 0 } as any) : undefined,
        ]}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          setContentLayoutHeight(h);
          console.log('[TrainingScreen-Debug] content layout height:', h);
        }}
      >
        {/* Lista principal: usar ScrollView no web e FlatList no mobile */}
        {isWeb ? (
          <ScrollView
            // Evitar altura fixa no web; usar flex assegura preenchimento e rolagem
            style={[styles.contentScroll, { flex: 1 } as any]}
            contentContainerStyle={{ paddingBottom: bottomScrollInset, paddingHorizontal: 15}}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {renderHeader()}
            {videoData.map((video) => renderVideoCard(video))}
            <View style={{ height: Layout.bottomMenuHeight }} />
          </ScrollView>
        ) : (
          <FlatList
            data={videoData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderVideoCard(item)}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={<View style={{ height: Layout.bottomMenuHeight }} />}
            style={[styles.contentScroll]}
            contentContainerStyle={{ paddingBottom: bottomScrollInset, paddingHorizontal: 15 }}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            scrollEnabled={true}
          />
        )}
      </View>

      {/* Bottom Menu movido para fora do container de conteúdo para evitar interferência */}
      <BottomMenu activeScreen="Products" />

        {/* Mini-player overlay (ao minimizar no VideoPlayerScreen) */}
        {miniVisible && (
          <View style={styles.miniPlayerContainer} pointerEvents="box-none">
            <View style={styles.miniTopRow}>
              <TouchableOpacity onPress={closeMini} style={styles.miniCloseButton}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <Path d="M6 6L18 18M6 18L18 6" stroke="#FCFCFC" strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={toggleMiniPlayPause} style={styles.miniCenterButton}>
              <Svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                {miniIsPlaying ? (
                  <Path d="M8 5H11V19H8V5ZM13 5H16V19H13V5Z" fill="#FCFCFC" />
                ) : (
                  <Path d="M8 5L19 12L8 19V5Z" fill="#FCFCFC" />
                )}
              </Svg>
            </TouchableOpacity>
            <View style={styles.miniProgressOverlay}>
              <View style={styles.miniProgressBackground} />
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: 4,
                  backgroundColor: '#1777CF',
                  width: miniProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }}
              />
            </View>
            {/* Vídeo real rodando por trás do overlay */}
            <Video
              ref={miniVideoRef}
              style={styles.miniVideo}
              source={{ uri: route.params?.miniPlayer?.sourceUri || '' }}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              shouldPlay={false}
              onPlaybackStatusUpdate={onMiniStatusUpdate}
            />
          </View>
        )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  headerWrapper: {
    position: 'relative',
    backgroundColor: '#FCFCFC',
  },
  customBackButton: {
    position: 'absolute',
    top: 44,
    left: 14,
    zIndex: 10,
    padding: 8,
  },
  content: {
     flex: 1,
     backgroundColor: '#FCFCFC',
     marginTop: 2,
     paddingTop: 10,
     position: 'relative',
    },
  contentScroll: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  productInfo: {
    paddingHorizontal: 0,
  },
  productTitle: {
    fontSize: 18,
    paddingLeft: 5,
    color: '#3A3F51',
    marginTop: 5,
    marginBottom: 15,
    fontFamily: 'Inter_700Bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F4',
    borderRadius: 8,
    padding: 4,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D8E0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1777CF',
  },
  tabText: {
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
  },
  activeTabText: {
    color: '#FCFCFC',
  },
  subTabContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  subTab: {
    flex: 1,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8E0F0',
  },
  activeSubTab: {
    borderColor: '#1777CF',
  },
  subTabText: {
    fontSize: 14,
    color: '#7D8592',
    fontFamily: 'Inter_500Medium',
  },
  activeSubTabText: {
    color: '#1777CF',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#D8E0F0',
    marginBottom: 17,
  },
  mediaTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginBottom: 20,
  },
  mediaTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D8E0F0',
  },
  activeMediaTypeButton: {
    borderColor: '#1777CF',
  },
  mediaTypeText: {
    fontSize: 14,
    color: '#7D8592',
    fontFamily: 'Inter_500Medium',
  },
  activeMediaTypeText: {
    color: '#1777CF',
  },
  videoList: {
    paddingHorizontal: 15,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    marginBottom: 15,
    backgroundColor: '#FCFCFC',
  },
  videoThumbnail: {
    width: 96,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#1777CF',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoThumbnailImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#FCFCFC',
    fontFamily: 'Inter_400Regular',
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 14,
    color: '#6F767E',
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  // bottom menu é fixo; não precisamos de espaçador aqui
  // Mini-player overlay estilos
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 220,
    height: 124,
    zIndex: 1000,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#00000080',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  miniTopRow: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
  },
  miniCloseButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCenterButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  miniProgressOverlay: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 8,
    height: 4,
    zIndex: 2,
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
  miniVideo: {
    width: '100%',
    height: '100%',
  },
});

export default TrainingScreen;