import React from 'react';
import { Modal, View, Text, StyleSheet, Platform, ScrollView, Pressable } from 'react-native';
import { Svg, Path, Rect } from 'react-native-svg';
import { printTextDocument, shareByEmail, shareByWhatsApp, downloadTextFile, shareDocumentToWhatsApp } from '../../utils/sharing';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  content?: string;
  onEdit?: () => void;
};

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================
const PAGE_CONFIG = {
  TOOLBAR_HEIGHT: 56,
  BOTTOM_BAR_HEIGHT: 60,
};

// ============================================================================
// ÍCONES
// ============================================================================
const EditIcon: React.FC<{ width?: number; height?: number }> = ({ width = 30, height = 30 }) => (
  <Svg width={width} height={height} viewBox="0 0 30 30" fill="none">
    <Rect width={30} height={30} rx={8} fill="#F4F4F4" />
    <Rect width={30} height={30} rx={8} stroke="#EDF2F6" />
    <Path fillRule="evenodd" clipRule="evenodd" d="M17.8387 8.58104L12.1613 14.2585C12.0373 14.3825 11.9676 14.5507 11.9676 14.7261V17.3712C11.9676 17.7364 12.2636 18.0324 12.6288 18.0324H15.2739C15.4493 18.0324 15.6175 17.9627 15.7415 17.8387L21.419 12.1613C22.1937 11.3865 22.1937 10.1305 21.419 9.35576L20.6442 8.58104C19.8695 7.80632 18.6135 7.80632 17.8387 8.58104ZM20.4838 10.2909L20.5388 10.3532C20.7405 10.6126 20.7222 10.9877 20.4838 11.2261L14.9988 16.7099H13.2901V14.9999L18.7739 9.51621C19.0321 9.25797 19.4508 9.25797 19.7091 9.51621L20.4838 10.2909Z" fill="#3A3F51" />
    <Path d="M14.633 9.43598C14.633 9.07078 14.337 8.77472 13.9718 8.77472H11.3063L11.1629 8.77777C9.4034 8.85287 8 10.3031 8 12.081V18.6937L8.00305 18.8371C8.07815 20.5966 9.52834 22 11.3063 22H17.919L18.0624 21.9969C19.8219 21.9218 21.2253 20.4717 21.2253 18.6937V15.4414L21.2208 15.3643C21.1826 15.0354 20.9031 14.7801 20.564 14.7801C20.1988 14.7801 19.9028 15.0762 19.9028 15.4414V18.6937L19.8994 18.8102C19.839 19.8516 18.9754 20.6775 17.919 20.6775H11.3063L11.1898 20.6741C10.1484 20.6138 9.32253 19.7502 9.32253 18.6937V12.081L9.3259 11.9645C9.38623 10.9231 10.2498 10.0972 11.3063 10.0972H13.9718L14.0489 10.0928C14.3777 10.0546 14.633 9.7751 14.633 9.43598Z" fill="#3A3F51" />
  </Svg>
);

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

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const ModalTextReader: React.FC<Props> = ({ visible, onClose, title, content, onEdit }) => {
  const [barsVisible, setBarsVisible] = React.useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const paragraphs = React.useMemo(() => {
    const txt = (content ?? '').trim();
    if (!txt) return [];
    return txt.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  }, [content]);

  // Quando as barras aparecem, ajustar o scroll para compensar o padding
  React.useEffect(() => {
    if (scrollViewRef.current) {
      if (barsVisible) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    }
  }, [barsVisible]);

  // Reset ao abrir
  React.useEffect(() => {
    if (visible) {
      setBarsVisible(false);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.readerBox} onPress={() => setBarsVisible(v => !v)}>
          {/* Conteúdo rolável */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scroll}
            scrollEventThrottle={16}
            contentContainerStyle={[
              styles.content,
              barsVisible && { paddingTop: PAGE_CONFIG.TOOLBAR_HEIGHT + 20 },
              barsVisible && { paddingBottom: PAGE_CONFIG.BOTTOM_BAR_HEIGHT + 20 },
            ]}
          >
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <Text key={i} style={styles.paragraph}>{p}</Text>
              ))
            ) : (
              <Text style={styles.paragraphMuted}>Sem conteúdo</Text>
            )}
          </ScrollView>

          {/* Barra superior - APENAS título e botão fechar */}
          {barsVisible && (
            <View style={styles.topBar}>
              <Text style={styles.topTitle} numberOfLines={1}>{title ?? 'Documento'}</Text>
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

          {/* Barra inferior - 5 ícones com espaçamento uniforme */}
          {barsVisible && (
            <View style={styles.bottomBar}>
              <Pressable 
                onPress={() => printTextDocument(title || 'Documento', content || '')} 
                accessibilityRole="button" 
                accessibilityLabel="Imprimir"
                style={styles.bottomActionButton}
              >
                <PrinterIcon />
              </Pressable>

              <Pressable 
                onPress={() => shareByEmail(title || 'Documento', content || '')} 
                accessibilityRole="button" 
                accessibilityLabel="Enviar por email"
                style={styles.bottomActionButton}
              >
                <EmailIcon />
              </Pressable>

              {/* Botão Editar no centro */}
              <Pressable 
                onPress={() => { onEdit?.(); }} 
                accessibilityRole="button" 
                accessibilityLabel="Editar documento"
                style={styles.bottomActionButton}
              >
                <EditIcon />
              </Pressable>

              <Pressable 
                onPress={() => shareDocumentToWhatsApp(`${(title || 'Documento').replace(/\s+/g, '-')}.txt`, content || '')} 
                accessibilityRole="button" 
                accessibilityLabel="Compartilhar no WhatsApp"
                style={styles.bottomActionButton}
              >
                <WhatsAppIcon />
              </Pressable>

              <Pressable 
                onPress={() => downloadTextFile(`${(title || 'Documento').replace(/\s+/g, '-')}.txt`, content || '')} 
                accessibilityRole="button" 
                accessibilityLabel="Baixar"
                style={styles.bottomActionButton}
              >
                <DownloadIcon />
              </Pressable>
            </View>
          )}
        </Pressable>
      </View>
    </Modal>
  );
};

export default ModalTextReader;

// ============================================================================
// ESTILOS
// ============================================================================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  readerBox: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FCFCFC',
    borderColor: '#D8E0F0',
    borderWidth: 1,
    position: 'relative',
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    rowGap: 10,
  },

  paragraph: {
    color: '#3A3F51',
    fontSize: 14,
    lineHeight: 20,
  },

  paragraphMuted: {
    color: '#91929E',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 16,
  },

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

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: PAGE_CONFIG.BOTTOM_BAR_HEIGHT,
    backgroundColor: 'rgba(23, 119, 207, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
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

  bottomActionButton: {
    padding: 8,
  },
});