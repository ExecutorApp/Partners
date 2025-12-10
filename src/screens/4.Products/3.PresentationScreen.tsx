import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ScreenNames } from '../../types/navigation';
import { useFonts, Inter_100Thin, Inter_200ExtraLight, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import Svg, { Path } from 'react-native-svg';
import Header from '../5.Side Menu/2.Header';
import BottomMenu from '../5.Side Menu/3.BottomMenu';
import { Layout } from '../../constants/theme';

// Interfaces
interface ProductData {
  id: string;
  title: string;
  commission: string;
  averageTicket: string;
  averageClosingTime: string;
  image?: any;
}

interface PresentationScreenParams {
  product: ProductData;
}

type PresentationScreenRouteProp = RouteProp<{ PresentationScreen: PresentationScreenParams }, 'PresentationScreen'>;

// SVG Icons
const DollarIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 1V23M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke="#FCFCFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PresentationScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'PresentationScreen'>>();
  const route = useRoute<PresentationScreenRouteProp>();
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Apresentação');

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

  if (!fontsLoaded) {
    return null;
  }

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Treinamento') {
      // Navegar para a tela de treinamento
      navigation.navigate(ScreenNames.TrainingScreen, { product });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFC" />
      
      {/* Header */}
      <View style={styles.headerWrapper}>
        <Header 
          title={''}
          notificationCount={6}
          onMenuPress={() => setSideMenuVisible(true)}
          showBackButton={false}
        />
        {/* Botão voltar customizado (SVG solicitado) */}
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
      <View style={styles.content}>
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{product.title}</Text>
          
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Apresentação' && styles.activeTab]}
              onPress={() => handleTabPress('Apresentação')}
            >
              <Text style={[styles.tabText, activeTab === 'Apresentação' && styles.activeTabText]}>
                Apresentação
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Treinamento' && styles.activeTab]}
              onPress={() => handleTabPress('Treinamento')}
            >
              <Text style={[styles.tabText, activeTab === 'Treinamento' && styles.activeTabText]}>
                Treinamento
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Materiais de apoio' && styles.activeTab]}
              onPress={() => handleTabPress('Materiais de apoio')}
            >
              <Text style={[styles.tabText, activeTab === 'Materiais de apoio' && styles.activeTabText]}>
                Material/Apoio
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content List */}
          <ScrollView
            style={styles.contentList}
            contentContainerStyle={{ paddingBottom: Layout.bottomMenuHeight }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descrição:</Text>
              <Text style={styles.sectionContent}>
                - Estrutura legal que protege o patrimônio e organiza bens familiares de forma estratégica e segura.
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Benefícios principais:</Text>
              <Text style={styles.sectionContent}>
                - Protege o patrimônio familiar e empresarial.{'\n'}
                - Facilita sucessão e herança sem litígios.{'\n'}
                - Reduz impostos e custos de transmissão.{'\n'}
                - Melhora gestão e transparência financeira.
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Público alvo:</Text>
              <Text style={styles.sectionContent}>
                - Empresários com mais de um imóvel ou CNPJ.{'\n'}
                - Famílias que querem proteger bens e planejar herança.{'\n'}
                - Clientes com faturamento acima de R$ 500 mil/ano.
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Comissão:</Text>
              <Text style={styles.sectionContent}>
                - Comissão: 20% sobre o valor da venda{'\n'}
                - Ticket médio: R$ 10.000{'\n'}
                - Tempo médio de fechamento: 30 dias
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Bottom Menu */}
        <BottomMenu activeScreen="Products" />
      </View>

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
  },
  customBackButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  content: {
    flex: 1,
    backgroundColor: '#FCFCFC',
    marginTop: 2,
    paddingTop: 10,
    position: 'relative',
  },
  productInfo: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 5,
    gap: 15,
  },
  productTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#3A3F51',
    paddingHorizontal: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    backgroundColor: '#F4F4F4',
    padding: 4,
    height: 40,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 10,
    height: 29,
  },
  activeTab: {
    backgroundColor: '#1777CF',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#3A3F51',
    textAlign: 'center',
    lineHeight: 15,
  },
  activeTabText: {
    color: '#FCFCFC',
  },
  contentList: {
    flex: 1,
    paddingTop: 10,
  },
  section: {
    gap: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#7D8592',
    lineHeight: 17,
    paddingVertical: 2,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#3A3F51',
    lineHeight: 20,
  },
  divider: {
    height: 0.1,
    backgroundColor: '#D8E0F0',
    marginVertical: 20,
  },
  // bottom menu é fixo; não precisamos de espaçador aqui
});

export default PresentationScreen;