import React from 'react';
import { Modal, View, Text, StyleSheet, Platform, Pressable, Linking, Alert, ScrollView } from 'react-native';
import { Svg, Path, Rect } from 'react-native-svg';
import { shareByWhatsApp, shareByEmail } from '../../utils/sharing';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  uri?: string;
  onEdit?: () => void;
  fileRef?: File;
};

// ============================================================================
// CONFIGURAÇÃO DE PÁGINA
// ============================================================================
const PAGE_CONFIG = {
  PAGE_PADDING_H: 24,
  PAGE_PADDING_V: 32,
  PAGE_BG: '#FFFFFF',
  PAGE_SEPARATOR_HEIGHT: 8,
  PAGE_SEPARATOR_COLOR: '#E0E0E0',
  TOOLBAR_HEIGHT: 56,
  BOTTOM_BAR_HEIGHT: 60,
  PAGINATION_COLUMN_WIDTH: 50,
};

// ============================================================================
// ÍCONES
// ============================================================================
const CloseIcon: React.FC<{ width?: number; height?: number }> = ({ width = 30, height = 30 }) => (
  <Svg width={width} height={height} viewBox="0 0 30 30" fill="none">
    <Rect width={30} height={30} rx={8} fill="#F4F4F4" />
    <Rect width={30} height={30} rx={8} stroke="#EDF2F6" />
    <Path d="M21.155 9.24793C20.7959 8.91788 20.2339 8.91729 19.874 9.24657L15 13.7065L10.126 9.24657C9.76609 8.91729 9.20412 8.91788 8.845 9.24793L8.7916 9.297C8.40222 9.65485 8.40289 10.257 8.79307 10.614L13.5863 15L8.79307 19.386C8.40289 19.743 8.40222 20.3451 8.7916 20.703L8.845 20.7521C9.20413 21.0821 9.76609 21.0827 10.126 20.7534L15 16.2935L19.874 20.7534C20.2339 21.0827 20.7959 21.0821 21.155 20.7521L21.2084 20.703C21.5978 20.3451 21.5971 19.743 21.2069 19.386L16.4137 15L21.2069 10.614C21.5971 10.257 21.5978 9.65485 21.2084 9.297L21.155 9.24793Z" fill="#3A3F51" />
  </Svg>
);

const PrinterIcon: React.FC<{ width?: number; height?: number }> = ({ width = 24, height = 21 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 21" fill="none">
    <Path d="M16.8583 5.6V1.75H6.475V5.6H4.725V0.875C4.725 0.627083 4.80885 0.419271 4.97656 0.251563C5.14427 0.0838542 5.35208 0 5.6 0H17.7333C17.9812 0 18.1891 0.0838542 18.3568 0.251563C18.5245 0.419271 18.6083 0.627083 18.6083 0.875V5.6H16.8583ZM19.2208 10.1208C19.4542 10.1208 19.6583 10.0333 19.8333 9.85833C20.0083 9.68333 20.0958 9.47917 20.0958 9.24583C20.0958 9.0125 20.0083 8.80833 19.8333 8.63333C19.6583 8.45833 19.4542 8.37083 19.2208 8.37083C18.9875 8.37083 18.7833 8.45833 18.6083 8.63333C18.4333 8.80833 18.3458 9.0125 18.3458 9.24583C18.3458 9.47917 18.4333 9.68333 18.6083 9.85833C18.7833 10.0333 18.9875 10.1208 19.2208 10.1208ZM6.475 19.25H16.8583V13.65H6.475V19.25ZM6.475 21C5.99375 21 5.58177 20.8286 5.23906 20.4859C4.89635 20.1432 4.725 19.7313 4.725 19.25V15.8667H0.875C0.627083 15.8667 0.419271 15.7828 0.251562 15.6151C0.0838542 15.4474 0 15.2396 0 14.9917V8.69167C0 7.81569 0.296528 7.08142 0.889583 6.48885C1.48264 5.89629 2.21667 5.6 3.09167 5.6H20.2417C21.1176 5.6 21.8519 5.89629 22.4445 6.48885C23.037 7.08142 23.3333 7.81569 23.3333 8.69167V14.9917C23.3333 15.2396 23.2495 15.4474 23.0818 15.6151C22.9141 15.7828 22.7062 15.8667 22.4583 15.8667H18.6083V19.25C18.6083 19.7313 18.437 20.1432 18.0943 20.4859C17.7516 20.8286 17.3396 21 16.8583 21H6.475ZM21.5833 14.1167V8.6854C21.5833 8.30069 21.4548 7.98194 21.1976 7.72917C20.9405 7.47639 20.6218 7.35 20.2417 7.35H3.09167C2.71153 7.35 2.39288 7.47858 2.13573 7.73573C1.87858 7.99288 1.75 8.31153 1.75 8.69167V14.1167H4.725V11.9H18.6083V14.1167H21.5833Z" fill="#FCFCFC" />
  </Svg>
);

const EmailIcon: React.FC<{ width?: number; height?: number }> = ({ width = 28, height = 20 }) => (
  <Svg width={width} height={height} viewBox="0 0 28 20" fill="none">
    <Path d="M3.28125 0.150391H24.7188C26.4429 0.150391 27.8494 1.57576 27.8496 3.33301V16.667C27.8494 18.4242 26.4429 19.8496 24.7188 19.8496H3.28125C1.55714 19.8496 0.150564 18.4242 0.150391 16.667V3.33301C0.150564 1.57576 1.55714 0.150391 3.28125 0.150391ZM25.7051 3.71191L16.2324 13.5059C15.6476 14.1104 14.8334 14.457 14 14.457C13.1667 14.457 12.3524 14.1104 11.7676 13.5059L2.29492 3.71191L2.03711 3.44531V16.667C2.03728 17.3601 2.5932 17.9277 3.28125 17.9277H24.7188C25.4068 17.9277 25.9627 17.3601 25.9629 16.667V3.44531L25.7051 3.71191ZM3.60547 2.32617L13.1123 12.1562C13.3446 12.3964 13.6674 12.5352 14 12.5352C14.3326 12.5352 14.6554 12.3964 14.8877 12.1562L24.3945 2.32617L24.6406 2.07227H3.35938L3.60547 2.32617Z" fill="#FCFCFC" stroke="#1777CF" strokeWidth={0.3} />
  </Svg>
);

const WhatsAppIcon: React.FC<{ width?: number; height?: number }> = ({ width = 21, height = 21 }) => (
  <Svg width={width} height={height} viewBox="0 0 21 21" fill="none">
    <Path d="M17.2145 3.05428C15.3339 1.18248 12.8321 0.150957 10.1695 0.149902C7.5128 0.149902 5.00703 1.18049 3.11404 3.05186C1.21769 4.92631 0.172385 7.41748 0.169922 10.0572V10.0621C0.170235 11.6599 0.590404 13.2717 1.38797 14.7429L0.197292 20.1499L5.67177 18.9058C7.05826 19.6039 8.60533 19.972 10.1657 19.9726H10.1696C12.8259 19.9726 15.3316 18.9419 17.2249 17.0704C19.1229 15.1943 20.1687 12.7063 20.1699 10.0649C20.1707 7.44209 19.1213 4.95229 17.2145 3.05428H17.2145ZM10.1695 18.4116H10.1659C8.7649 18.411 7.37669 18.0596 6.15161 17.3951L5.89277 17.2547L2.25247 18.0819L3.04315 14.4918L2.89074 14.2292C2.13286 12.9235 1.73236 11.4821 1.73236 10.0604C1.73525 5.45889 5.51971 1.71084 10.1691 1.71084C12.4152 1.71178 14.5257 2.5817 16.1117 4.16006C17.7217 5.76283 18.608 7.85971 18.6072 10.0645C18.6054 14.6671 14.8202 18.4116 10.1695 18.4116Z" fill="#FCFCFC" />
    <Path d="M7.44848 5.69143H7.01017C6.85756 5.69143 6.60982 5.7485 6.40028 5.97631C6.19055 6.20428 5.59963 6.75529 5.59963 7.87592C5.59963 8.99654 6.41936 10.0792 6.53362 10.2314C6.64802 10.3833 8.11596 12.7564 10.4409 13.6694C12.3731 14.428 12.7664 14.2771 13.1857 14.2391C13.6051 14.2012 14.539 13.6883 14.7297 13.1565C14.9203 12.6247 14.9203 12.1688 14.8631 12.0736C14.8059 11.9787 14.6533 11.9217 14.4246 11.808C14.1959 11.6939 13.0748 11.1337 12.8651 11.0575C12.6554 10.9817 12.5029 10.9437 12.3504 11.1718C12.1978 11.3994 11.7486 11.9262 11.6151 12.0781C11.4818 12.2303 11.3483 12.2494 11.1195 12.1354C10.8907 12.0211 10.1615 11.7763 9.28771 11.0006C8.6076 10.3968 8.13566 9.62682 8.00214 9.39885C7.8688 9.17103 7.98794 9.04775 8.10262 8.93408C8.20546 8.83213 8.34426 8.69268 8.45867 8.55978C8.57292 8.42674 8.60545 8.33182 8.68181 8.17982C8.75806 8.02787 8.71986 7.89482 8.66273 7.781C8.60545 7.66697 8.16651 6.54076 7.96304 6.09029H7.96319C7.79186 5.711 7.61145 5.69811 7.44848 5.69143Z" fill="#FCFCFC" />
    <Path d="M17.2145 3.05428C15.3339 1.18248 12.8321 0.150957 10.1695 0.149902C7.5128 0.149902 5.00703 1.18049 3.11404 3.05186C1.21769 4.92631 0.172385 7.41748 0.169922 10.0572V10.0621C0.170235 11.6599 0.590404 13.2717 1.38797 14.7429L0.197292 20.1499L5.67177 18.9058C7.05826 19.6039 8.60533 19.972 10.1657 19.9726H10.1696C12.8259 19.9726 15.3316 18.9419 17.2249 17.0704C19.1229 15.1943 20.1687 12.7063 20.1699 10.0649C20.1707 7.44209 19.1213 4.95229 17.2145 3.05428H17.2145ZM10.1695 18.4116H10.1659C8.7649 18.411 7.37669 18.0596 6.15161 17.3951L5.89277 17.2547L2.25247 18.0819L3.04315 14.4918L2.89074 14.2292C2.13286 12.9235 1.73236 11.4821 1.73236 10.0604C1.73525 5.45889 5.51971 1.71084 10.1691 1.71084C12.4152 1.71178 14.5257 2.5817 16.1117 4.16006C17.7217 5.76283 18.608 7.85971 18.6072 10.0645C18.6054 14.6671 14.8202 18.4116 10.1695 18.4116Z" stroke="#FCFCFC" strokeWidth={0.3} />
    <Path d="M7.44848 5.69143H7.01017C6.85756 5.69143 6.60982 5.7485 6.40028 5.97631C6.19055 6.20428 5.59963 6.75529 5.59963 7.87592C5.59963 8.99654 6.41936 10.0792 6.53362 10.2314C6.64802 10.3833 8.11596 12.7564 10.4409 13.6694C12.3731 14.428 12.7664 14.2771 13.1857 14.2391C13.6051 14.2012 14.539 13.6883 14.7297 13.1565C14.9203 12.6247 14.9203 12.1688 14.8631 12.0736C14.8059 11.9787 14.6533 11.9217 14.4246 11.808C14.1959 11.6939 13.0748 11.1337 12.8651 11.0575C12.6554 10.9817 12.5029 10.9437 12.3504 11.1718C12.1978 11.3994 11.7486 11.9262 11.6151 12.0781C11.4818 12.2303 11.3483 12.2494 11.1195 12.1354C10.8907 12.0211 10.1615 11.7763 9.28771 11.0006C8.6076 10.3968 8.13566 9.62682 8.00214 9.39885C7.8688 9.17103 7.98794 9.04775 8.10262 8.93408C8.20546 8.83213 8.34426 8.69268 8.45867 8.55978C8.57292 8.42674 8.60545 8.33182 8.68181 8.17982C8.75806 8.02787 8.71986 7.89482 8.66273 7.781C8.60545 7.66697 8.16651 6.54076 7.96304 6.09029H7.96319C7.79186 5.711 7.61145 5.69811 7.44848 5.69143Z" stroke="#FCFCFC" strokeWidth={0.3} />
  </Svg>
);

const DownloadIcon: React.FC<{ width?: number; height?: number }> = ({ width = 21, height = 20 }) => (
  <Svg width={width} height={height} viewBox="0 0 21 20" fill="none">
    <Path d="M10.4813 9.54037C10.971 9.54037 11.3741 9.90799 11.4292 10.3809L11.4356 10.4908V16.7534L13.6255 14.5725C13.9696 14.2302 14.5107 14.2048 14.8851 14.4945L14.9762 14.5725C15.3204 14.9153 15.3457 15.4555 15.0545 15.8285L14.9762 15.9177L11.1559 19.7224C10.8116 20.0646 10.2706 20.0903 9.89629 19.8004L9.80677 19.7224L5.98647 15.9177C5.61402 15.5463 5.61374 14.9437 5.98647 14.5725C6.33067 14.2298 6.87314 14.2045 7.24765 14.4945L7.33716 14.5725L9.52705 16.7534V10.4908C9.52722 9.96573 9.95411 9.54038 10.4813 9.54037ZM8.79335 0.039715C11.7172 0.428015 14.1703 2.37582 15.2032 5.07023L15.3055 5.35518H15.7322C17.9759 5.35518 20.0128 6.93407 20.7929 9.20607L20.8681 9.43531C21.1942 10.9511 20.9086 12.4245 20.0896 13.8227C19.8239 14.2762 19.2391 14.4295 18.7837 14.1649C18.3287 13.9002 18.1746 13.3178 18.44 12.8643C19.029 11.8587 19.2212 10.8639 19.0187 9.90811C18.5722 8.42648 17.2841 7.3463 15.9049 7.26232L15.7322 7.25754H14.5862C14.143 7.25718 13.7585 6.95338 13.6574 6.52366C13.0857 4.08328 11.0404 2.25621 8.57277 1.92775C6.10539 1.68202 3.70506 2.99499 2.55779 5.19758C1.54719 7.29508 1.73589 10.743 2.97339 12.6335C3.26145 13.0734 3.13695 13.6631 2.69526 13.95C2.25369 14.2364 1.66293 14.1126 1.37493 13.673C-0.23193 11.2192 -0.460694 7.06393 0.849041 4.34749C2.36752 1.43096 5.51223 -0.287575 8.79335 0.039715Z" fill="#FCFCFC" />
  </Svg>
);

// Ícones para a coluna de paginação
const ArrowRectDownIcon: React.FC<{ width?: number; height?: number }> = ({ width = 30, height = 25 }) => (
  <Svg width={width} height={height} viewBox="0 0 30 25" fill="none">
    <Rect x={0.25} y={0.25} width={29.5} height={24.5} rx={3.75} fill="#1777CF" />
    <Rect x={0.25} y={0.25} width={29.5} height={24.5} rx={3.75} stroke="#D8E0F0" strokeWidth={0.5} />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.7238 8.77917C20.3655 8.39637 19.7958 8.40879 19.4512 8.80689L15 14.0572L10.5488 8.80689C10.2042 8.40879 9.6345 8.39637 9.2762 8.77917C8.91791 9.16196 8.90674 9.795 9.25125 10.1931L14.3513 16.1931C14.5209 16.3892 14.7552 16.5 15 16.5C15.2448 16.5 15.4791 16.3892 15.6487 16.1931L20.7487 10.1931C21.0933 9.795 21.0821 9.16196 20.7238 8.77917Z"
      fill="#FCFCFC"
    />
  </Svg>
);

const ArrowRectUpIcon: React.FC<{ width?: number; height?: number }> = ({ width = 30, height = 25 }) => (
  <Svg width={width} height={height} viewBox="0 0 30 25" fill="none">
    <Rect x={0.25} y={0.25} width={29.5} height={24.5} rx={3.75} fill="#1777CF" />
    <Rect x={0.25} y={0.25} width={29.5} height={24.5} rx={3.75} stroke="#D8E0F0" strokeWidth={0.5} />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.7238 8.77917C20.3655 8.39637 19.7958 8.40879 19.4512 8.80689L15 14.0572L10.5488 8.80689C10.2042 8.40879 9.6345 8.39637 9.2762 8.77917C8.91791 9.16196 8.90674 9.795 9.25125 10.1931L14.3513 16.1931C14.5209 16.3892 14.7552 16.5 15 16.5C15.2448 16.5 15.4791 16.3892 15.6487 16.1931L20.7487 10.1931C21.0933 9.795 21.0821 9.16196 20.7238 8.77917Z"
      fill="#FCFCFC"
      transform="rotate(180 15 12.5)"
    />
  </Svg>
);

// ============================================================================
// COMPONENTE: COLUNA VERTICAL DE PAGINAÇÃO
// ============================================================================
interface PaginationColumnProps {
  currentPage: number;
  totalPages: number;
  onPageSelect: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const PaginationColumn: React.FC<PaginationColumnProps> = ({
  currentPage,
  totalPages,
  onPageSelect,
  onPreviousPage,
  onNextPage,
}) => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const PAGE_ITEM_HEIGHT = 30;
  const PAGE_ITEM_GAP = 6;
  const lastScrolledPageRef = React.useRef<number>(0);

  // Scroll automático para manter a página atual visível (sem animação para evitar flickering)
  React.useEffect(() => {
    if (scrollViewRef.current && currentPage > 0 && currentPage !== lastScrolledPageRef.current) {
      lastScrolledPageRef.current = currentPage;
      const offset = (currentPage - 1) * (PAGE_ITEM_HEIGHT + PAGE_ITEM_GAP);
      // Usar scrollTo sem animação para evitar tremores
      scrollViewRef.current.scrollTo({ y: Math.max(0, offset - 60), animated: false });
    }
  }, [currentPage]);

  // Gera array de páginas (memoizado para evitar re-renders)
  const pages = React.useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Handler memoizado para seleção de página
  const handlePageSelect = React.useCallback((page: number) => {
    if (page !== currentPage) {
      onPageSelect(page);
    }
  }, [currentPage, onPageSelect]);

  return (
    <View style={paginationStyles.container}>
      {/* Botão Superior FIXO - Página Anterior */}
      <Pressable
        style={[
          paginationStyles.navButton,
          !canGoPrevious && paginationStyles.navButtonDisabled,
        ]}
        onPress={onPreviousPage}
        disabled={!canGoPrevious}
        accessibilityRole="button"
        accessibilityLabel="Página anterior"
      >
        <ArrowRectUpIcon />
      </Pressable>

      {/* Lista de Páginas CENTRAL (rolável) */}
      <ScrollView
        ref={scrollViewRef}
        style={paginationStyles.pagesList}
        contentContainerStyle={paginationStyles.pagesListContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
      >
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <Pressable
              key={page}
              style={[
                paginationStyles.pageItem,
                isActive && paginationStyles.pageItemActive,
              ]}
              onPress={() => handlePageSelect(page)}
              accessibilityRole="button"
              accessibilityLabel={`Ir para página ${page}`}
            >
              <Text
                style={[
                  paginationStyles.pageItemText,
                  isActive && paginationStyles.pageItemTextActive,
                ]}
              >
                {String(page).padStart(2, '0')}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Botão Inferior FIXO - Próxima Página */}
      <Pressable
        style={[
          paginationStyles.navButton,
          !canGoNext && paginationStyles.navButtonDisabled,
        ]}
        onPress={onNextPage}
        disabled={!canGoNext}
        accessibilityRole="button"
        accessibilityLabel="Próxima página"
      >
        <ArrowRectDownIcon />
      </Pressable>
    </View>
  );
};

// Estilos da coluna de paginação
const paginationStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: PAGE_CONFIG.PAGINATION_COLUMN_WIDTH,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },

  navButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  navButtonDisabled: {
    opacity: 0.5,
  },

  pagesList: {
    flex: 1,
    width: '100%',
    marginVertical: 6,
  },

  pagesListContent: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },

  pageItem: {
    width: 30,
    height: 30,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FCFCFC',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#D8E0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  pageItemActive: {
    backgroundColor: '#1777CF',
    borderColor: '#FCFCFC',
    borderWidth: 1.5,
  },

  pageItemText: {
    color: '#3A3F51',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },

  pageItemTextActive: {
    color: '#FCFCFC',
    fontFamily: 'Inter_500Medium',
  },
});

// ============================================================================
// GERADOR DO SRCDOC PARA PDF
// ============================================================================

const generatePdfSrcDoc = (dataSource: string, isBase64: boolean = false, topOffset: number = 0): string => {
  const pageBg = PAGE_CONFIG.PAGE_BG;
  const separatorHeight = PAGE_CONFIG.PAGE_SEPARATOR_HEIGHT;
  const separatorColor = PAGE_CONFIG.PAGE_SEPARATOR_COLOR;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
  <title>Visualizador PDF</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html, body {
      width: 100%;
      height: 100%;
      background: ${pageBg};
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
      font-weight: 400;
      -webkit-tap-highlight-color: transparent;
      touch-action: pan-y;
    }
    
    #viewer {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      background: ${pageBg};
      cursor: pointer;
      padding-top: ${topOffset}px;
      transition: padding-top 0.15s ease-out;
    }
    
    #container {
      width: 100%;
      min-height: 100%;
      background: ${pageBg};
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .page-wrapper {
      width: 100%;
      max-width: 100%;
      background: ${pageBg};
      position: relative;
      display: flex;
      justify-content: center;
      padding: 0;
    }
    
    .page-wrapper::after {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: ${separatorHeight}px;
      background: ${separatorColor};
    }
    
    .page-wrapper:last-child::after {
      display: none;
    }
    
    .page-wrapper canvas {
      display: block;
      max-width: 100%;
      height: auto !important;
    }
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 300px;
      color: #666;
      font-size: 14px;
      gap: 16px;
    }
    
    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #E0E0E0;
      border-top-color: #1777CF;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 200px;
      color: #D32F2F;
      font-size: 14px;
      text-align: center;
      padding: 20px;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"><\/script>
</head>
<body>
  <div id="viewer">
    <div id="container">
      <div class="loading-state" id="loading">
        <div class="loading-spinner"></div>
        <span>Carregando documento…</span>
      </div>
    </div>
  </div>
  
  <script>
  (function() {
    var dataSource = "${dataSource.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
    var isBase64 = ${isBase64};
    var viewer = document.getElementById('viewer');
    var container = document.getElementById('container');
    var loading = document.getElementById('loading');
    
    var currentPage = 1;
    var totalPages = 1;
    var pageOffsets = [];
    var pdfDoc = null;
    var isNavigating = false;
    
    // Configurações de toque - TAP RÁPIDO
    var touchStartY = null;
    var touchStartX = null;
    var touchStartTime = null;
    var isTap = false;
    var tapThreshold = 15;
    var tapTimeThreshold = 500; // Aumentado para 500ms para capturar taps rápidos
    
    // Configurar worker do PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    function notifyParent(data) {
      try {
        var msg = JSON.stringify(data);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(msg);
        }
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(data, '*');
        }
      } catch(e) {}
    }
    
    function notifyPageChange(current, total) {
      notifyParent({ type: 'pageChange', currentPage: current, totalPages: total });
    }
    
    function notifyReady(total) {
      notifyParent({ type: 'ready', totalPages: total });
    }
    
    function notifyToggleBars() {
      notifyParent({ type: 'toggleBars' });
    }
    
    // Função para atualizar o padding top
    window.setTopOffset = function(offset) {
      viewer.style.paddingTop = offset + 'px';
      // Recalcular offsets após mudança de padding
      setTimeout(calculatePageOffsets, 50);
    };
    
    function detectCurrentPage() {
      if (pageOffsets.length === 0 || isNavigating) return;
      
      var scrollTop = viewer.scrollTop;
      var viewerHeight = viewer.clientHeight;
      var viewCenter = scrollTop + (viewerHeight / 3);
      var newPage = 1;
      
      for (var i = 0; i < pageOffsets.length; i++) {
        if (viewCenter >= pageOffsets[i].start) {
          newPage = i + 1;
        }
      }
      
      if (newPage !== currentPage) {
        currentPage = newPage;
        notifyPageChange(currentPage, totalPages);
      }
    }
    
    // Navegação INSTANTÂNEA para a página (sem animação smooth)
    window.goToPage = function(pageNum) {
      if (pageNum < 1 || pageNum > totalPages || !pageOffsets[pageNum - 1]) return;
      
      isNavigating = true;
      currentPage = pageNum;
      
      // Scroll INSTANTÂNEO - sem behavior: 'smooth'
      viewer.scrollTop = pageOffsets[pageNum - 1].start;
      
      notifyPageChange(currentPage, totalPages);
      
      // Liberar detecção de scroll após um pequeno delay
      setTimeout(function() {
        isNavigating = false;
      }, 100);
    };
    
    function calculatePageOffsets() {
      pageOffsets = [];
      var wrappers = container.querySelectorAll('.page-wrapper');
      var paddingTop = parseInt(viewer.style.paddingTop) || 0;
      
      wrappers.forEach(function(wrapper, index) {
        pageOffsets.push({
          start: wrapper.offsetTop,
          end: wrapper.offsetTop + wrapper.offsetHeight
        });
      });
      
      return pageOffsets.length;
    }
    
    function showError(msg) {
      loading.innerHTML = '<div class="error-state">' + msg + '</div>';
    }
    
    async function renderPage(pdf, pageNum) {
      var page = await pdf.getPage(pageNum);
      var containerWidth = container.clientWidth || window.innerWidth;
      var viewport = page.getViewport({ scale: 1 });
      var scale = containerWidth / viewport.width;
      var scaledViewport = page.getViewport({ scale: scale });
      
      var wrapper = document.createElement('div');
      wrapper.className = 'page-wrapper';
      wrapper.style.marginBottom = '${separatorHeight}px';
      wrapper.setAttribute('data-page', pageNum);
      
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;
      
      wrapper.appendChild(canvas);
      container.appendChild(wrapper);
      
      await page.render({
        canvasContext: context,
        viewport: scaledViewport
      }).promise;
    }
    
    async function renderAllPages(pdf) {
      loading.style.display = 'none';
      container.innerHTML = '';
      
      totalPages = pdf.numPages;
      
      for (var i = 1; i <= totalPages; i++) {
        await renderPage(pdf, i);
      }
      
      setTimeout(function() {
        calculatePageOffsets();
        viewer.addEventListener('scroll', detectCurrentPage, { passive: true });
        notifyReady(totalPages);
        notifyPageChange(1, totalPages);
      }, 150);
    }
    
    async function loadDocument() {
      try {
        var loadingTask;
        
        if (isBase64) {
          var bin = atob(dataSource);
          var len = bin.length;
          var bytes = new Uint8Array(len);
          for (var i = 0; i < len; i++) {
            bytes[i] = bin.charCodeAt(i);
          }
          loadingTask = pdfjsLib.getDocument({ data: bytes });
        } else {
          loadingTask = pdfjsLib.getDocument(dataSource);
        }
        
        pdfDoc = await loadingTask.promise;
        await renderAllPages(pdfDoc);
        
      } catch(err) {
        console.error('Erro ao carregar PDF:', err);
        showError('Falha ao carregar o documento');
      }
    }
    
    // TOUCH: Detectar tap rápido
    viewer.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchStartTime = Date.now();
        isTap = true;
      }
    }, { passive: true });
    
    viewer.addEventListener('touchmove', function(e) {
      if (touchStartY !== null && touchStartX !== null && e.touches.length === 1) {
        var deltaY = Math.abs(e.touches[0].clientY - touchStartY);
        var deltaX = Math.abs(e.touches[0].clientX - touchStartX);
        if (deltaY > tapThreshold || deltaX > tapThreshold) {
          isTap = false;
        }
      }
    }, { passive: true });
    
    viewer.addEventListener('touchend', function(e) {
      if (isTap && touchStartTime !== null) {
        var elapsed = Date.now() - touchStartTime;
        // Tap rápido: qualquer toque menor que 500ms
        if (elapsed < tapTimeThreshold) {
          e.preventDefault();
          notifyToggleBars();
        }
      }
      touchStartY = null;
      touchStartX = null;
      touchStartTime = null;
      isTap = false;
    }, { passive: false });
    
    // CLICK: Resposta imediata
    viewer.addEventListener('click', function(e) {
      e.preventDefault();
      notifyToggleBars();
    });
    
    var resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        if (pdfDoc) {
          var currentScrollRatio = viewer.scrollTop / (viewer.scrollHeight - viewer.clientHeight);
          renderAllPages(pdfDoc).then(function() {
            var newScrollTop = currentScrollRatio * (viewer.scrollHeight - viewer.clientHeight);
            viewer.scrollTop = newScrollTop;
          });
        }
      }, 200);
    });
    
    loadDocument();
  })();
  <\/script>
</body>
</html>`;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const ModalPdfReader: React.FC<Props> = ({ visible, onClose, title, uri, onEdit, fileRef }) => {
  const [barsVisible, setBarsVisible] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const safeTitle = title || 'Documento PDF';

  const [inlinePdfBase64, setInlinePdfBase64] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    let cancelled = false;
    
    async function toBase64FromFile(f: File) {
      try {
        const buf = await f.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const b64 = btoa(binary);
        if (!cancelled) setInlinePdfBase64(b64);
      } catch (err) {
        if (!cancelled) setInlinePdfBase64(null);
      }
    }
    
    async function toBase64FromBlobUrl(u: string) {
      try {
        const res = await fetch(u);
        const blob = await res.blob();
        const buf = await blob.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const b64 = btoa(binary);
        if (!cancelled) setInlinePdfBase64(b64);
      } catch (err) {}
    }
    
    if (Platform.OS === 'web') {
      if (fileRef instanceof File) {
        toBase64FromFile(fileRef);
      } else if (typeof uri === 'string' && /^blob:/i.test(uri)) {
        toBase64FromBlobUrl(uri);
      }
    }
    
    return () => { cancelled = true; };
  }, [fileRef, uri]);

  const iframeSrcDoc = React.useMemo(() => {
    if (Platform.OS !== 'web') return undefined;
    
    if (inlinePdfBase64) {
      return generatePdfSrcDoc(inlinePdfBase64, true, 0);
    }
    
    if (uri && /^https?:\/\//i.test(uri)) {
      return generatePdfSrcDoc(uri, false, 0);
    }
    
    return undefined;
  }, [uri, inlinePdfBase64]);

  // Atualizar padding do iframe quando barras mudam
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow && (iframe.contentWindow as any).setTopOffset) {
        const offset = barsVisible ? PAGE_CONFIG.TOOLBAR_HEIGHT : 0;
        (iframe.contentWindow as any).setTopOffset(offset);
      }
    } catch (e) {}
  }, [barsVisible]);

  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.type === 'pageChange') {
          setCurrentPage(data.currentPage);
          setTotalPages(data.totalPages);
        } else if (data.type === 'ready') {
          setTotalPages(data.totalPages);
          setCurrentPage(1);
        } else if (data.type === 'toggleBars') {
          setBarsVisible(prev => !prev);
        }
      } catch (e) {}
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    const prev = document.body.style.overflow || '';
    if (visible) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  React.useEffect(() => {
    if (visible) {
      setBarsVisible(false);
    }
  }, [visible]);

  // Navegação instantânea para a página
  const goToPage = React.useCallback((pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        (iframe.contentWindow as any).goToPage(pageNum);
      }
    } catch (e) {}
  }, [totalPages]);

  const handlePreviousPage = React.useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const handleNextPage = React.useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const handlePageSelect = React.useCallback((page: number) => {
    goToPage(page);
  }, [goToPage]);

  const handlePrint = () => {
    if (Platform.OS === 'web' && uri) {
      const w = window.open(uri, '_blank');
      if (!w) {
        Alert.alert('Atenção', 'O navegador bloqueou a abertura.');
      }
    }
  };

  const handleDownload = () => {
    if (Platform.OS === 'web' && uri) {
      const a = document.createElement('a');
      a.href = uri;
      a.download = `${safeTitle.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (uri) {
      Linking.openURL(uri).catch(() => Alert.alert('Erro', 'Não foi possível abrir o arquivo.'));
    }
  };

  const handleEmail = () => {
    if (uri) shareByEmail(safeTitle, uri);
  };

  const handleWhatsApp = () => {
    if (uri) shareByWhatsApp(uri);
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Área do documento */}
        <View style={styles.documentArea}>
          {Platform.OS === 'web' ? (
            iframeSrcDoc ? (
              <iframe
                ref={iframeRef as any}
                srcDoc={iframeSrcDoc}
                style={styles.iframe as any}
                title={safeTitle}
              />
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.paragraphMuted}>
                  Carregando documento...
                </Text>
              </View>
            )
          ) : (
            <View style={styles.mobileBox}>
              <Text style={styles.paragraphMuted}>
                Visualização embutida de PDF não disponível.{'\n'}
                Toque em Download para abrir.
              </Text>
            </View>
          )}
        </View>

        {/* Barra superior - TODA a largura da tela */}
        {barsVisible && (
          <View style={styles.topBar}>
            <Text style={styles.topTitle} numberOfLines={1}>
              {safeTitle}
            </Text>
            <View style={styles.topActions}>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Fechar documento"
                style={styles.topActionButton}
              >
                <CloseIcon />
              </Pressable>
            </View>
          </View>
        )}

        {/* COLUNA VERTICAL DE PAGINAÇÃO - ENTRE as barras */}
        {barsVisible && totalPages > 0 && (
          <View style={styles.paginationColumnWrapper}>
            <PaginationColumn
              currentPage={currentPage}
              totalPages={totalPages}
              onPageSelect={handlePageSelect}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
            />
          </View>
        )}

        {/* Barra inferior - TODA a largura da tela */}
        {barsVisible && (
          <View style={styles.bottomBar}>
            <View style={styles.bottomLeft}>
              <Pressable
                onPress={handlePrint}
                accessibilityRole="button"
                accessibilityLabel="Imprimir"
                style={styles.bottomActionButton}
              >
                <PrinterIcon />
              </Pressable>
              <Pressable
                onPress={handleEmail}
                accessibilityRole="button"
                accessibilityLabel="Enviar por email"
                style={styles.bottomActionButton}
              >
                <EmailIcon />
              </Pressable>
            </View>

            <View style={styles.bottomCenter}>
              <View style={styles.pageIndicator}>
                <Text style={styles.pageIndicatorText}>
                  {String(currentPage).padStart(2, '0')}/{String(totalPages).padStart(2, '0')}
                </Text>
              </View>
            </View>

            <View style={styles.bottomRight}>
              <Pressable
                onPress={handleWhatsApp}
                accessibilityRole="button"
                accessibilityLabel="Compartilhar no WhatsApp"
                style={styles.bottomActionButton}
              >
                <WhatsAppIcon />
              </Pressable>
              <Pressable
                onPress={handleDownload}
                accessibilityRole="button"
                accessibilityLabel="Baixar"
                style={styles.bottomActionButton}
              >
                <DownloadIcon />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default ModalPdfReader;

// ============================================================================
// ESTILOS
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_CONFIG.PAGE_BG,
  },

  documentArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PAGE_CONFIG.PAGE_BG,
  },

  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: PAGE_CONFIG.PAGE_BG,
  } as any,

  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PAGE_CONFIG.PAGE_BG,
  },

  mobileBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: PAGE_CONFIG.PAGE_BG,
  },

  paragraphMuted: {
    color: '#999999',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },

  // Barra superior - TODA a largura (right: 0)
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PAGE_CONFIG.TOOLBAR_HEIGHT,
    backgroundColor: '#1777CF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 12,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      default: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      },
    }),
  },

  topTitle: {
    flex: 1,
    color: '#FCFCFC',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    marginRight: 12,
  },

  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  topActionButton: {
    padding: 4,
  },

  // Coluna de paginação - ENTRE as barras (não sobrepõe)
  paginationColumnWrapper: {
    position: 'absolute',
    top: PAGE_CONFIG.TOOLBAR_HEIGHT,
    right: 0,
    bottom: PAGE_CONFIG.BOTTOM_BAR_HEIGHT,
    width: PAGE_CONFIG.PAGINATION_COLUMN_WIDTH,
    zIndex: 15,
  },

  // Barra inferior - TODA a largura (right: 0)
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: PAGE_CONFIG.BOTTOM_BAR_HEIGHT,
    backgroundColor: 'rgba(23, 119, 207, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      default: {
        boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
      },
    }),
  },

  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
    gap: 16,
  },

  bottomCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 16,
  },

  bottomActionButton: {
    padding: 8,
  },

  pageIndicator: {
    minWidth: 70,
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  pageIndicatorText: {
    color: '#FCFCFC',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});