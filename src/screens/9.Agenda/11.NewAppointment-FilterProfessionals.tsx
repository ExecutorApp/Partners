import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface FilterProfessionalsProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { sector?: string; area?: string; profile?: string; selectedProfessionalId?: string | null }) => void;
  sectors: string[];
  areasBySector: Record<string, string[]>;
  profilesByArea: Record<string, string[]>;
  selectedSector?: string;
  selectedArea?: string;
  selectedProfile?: string;
  professionals: Array<{ id: string; name: string; photo: any; sector: string; area: string; profile: string; profileDisplay?: string }>;
}

// Ícones (originais do Figma) ----------------------------------------------
const ArrowIcon = () => (
  <Svg width={8} height={12} viewBox="0 0 8 12" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.72083 0.276203C8.10363 0.634498 8.09121 1.20424 7.69311 1.54875L2.44277 6L7.69311 10.4513C8.09121 10.7958 8.10363 11.3655 7.72083 11.7238C7.33804 12.0821 6.705 12.0933 6.30689 11.7487L0.306891 6.64875C0.110812 6.47907 0 6.24482 0 6C0 5.75518 0.110812 5.52093 0.306891 5.35125L6.30689 0.251251C6.705 -0.0932627 7.33804 -0.0820913 7.72083 0.276203Z"
      fill="#FCFCFC"
    />
  </Svg>
);

const CloseXIcon = () => (
  <Svg width={13} height={12} viewBox="0 0 13 12" fill="none">
    <Path d="M12.655 0.247926C12.2959 -0.0821192 11.7339 -0.0827124 11.374 0.246573L6.5 4.70646L1.62595 0.246573C1.26609 -0.0827126 0.704125 -0.0821187 0.344999 0.247926L0.291597 0.297004C-0.0977822 0.654853 -0.0971065 1.25701 0.293074 1.61404L5.08634 6L0.293074 10.386C-0.0971063 10.743 -0.0977808 11.3451 0.291598 11.703L0.345 11.7521C0.704126 12.0821 1.26609 12.0827 1.62595 11.7534L6.5 7.29354L11.374 11.7534C11.7339 12.0827 12.2959 12.0821 12.655 11.7521L12.7084 11.703C13.0978 11.3451 13.0971 10.743 12.7069 10.386L7.91366 6L12.7069 1.61404C13.0971 1.25701 13.0978 0.654853 12.7084 0.297004L12.655 0.247926Z" fill="#3A3F51"/>
  </Svg>
);

const SearchIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path d="M15 15L11.6556 11.6556M13.4444 7.22222C13.4444 10.6587 10.6587 13.4444 7.22222 13.4444C3.78578 13.4444 1 10.6587 1 7.22222C1 3.78578 3.78578 1 7.22222 1C10.6587 1 13.4444 3.78578 13.4444 7.22222Z" stroke="#7D8592" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Botão de rádio — ajustado para inativo mais encorpado e sem margem branca
const RadioDot: React.FC<{ selected?: boolean }> = ({ selected }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    {selected ? (
      <>
        {/* Anel externo preenchido (ativo) */}
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z"
          fill="#1777CF"
        />
        {/* Ponto interno (ativo) */}
        <Path d="M5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10Z" fill="#1777CF" />
      </>
    ) : (
      <>
        {/* Anel inativo mais espesso e sem stroke branco */}
        <Circle cx={10} cy={10} r={8} stroke="#6F7DA0" strokeWidth={1.5} fill="none" />
      </>
    )}
  </Svg>
);

// ------------------ Geração de 30 profissionais (intercalando combinações) ------------------
type GeneratedProfessional = { id: string; name: string; photo: any; sector: string; area: string; profile: string; profileDisplay?: string };

const namesPool = [
  'Joaquim Aparecido Bernardo', 'Ana Luiza Martins', 'Bruno César Azevedo', 'Carla Nunes', 'Diego Almeida',
  'Rafaela Souza', 'Marcos Vinicius', 'Paula Ferreira', 'Renato Gomes', 'Camila Rodrigues',
  'Felipe Santos', 'Larissa Teixeira', 'Gustavo Silva', 'Patrícia Moreira', 'Thiago Ribeiro',
  'Juliana Costa', 'Lucas Monteiro', 'Fernanda Oliveira', 'André Pereira', 'Beatriz Santos',
  'Sérgio Carvalho', 'Aline Dias', 'Daniel Albuquerque', 'Marta Figueiredo', 'Ricardo Lopes',
  'Isabela Rocha', 'Hugo Fernandes', 'Letícia Barreto', 'Eduardo Campos', 'Natália Pires'
];

const photosPool = [
  require('../../../assets/01-Foto.png'),
  require('../../../assets/02-Foto.png'),
  require('../../../assets/03-Foto.png'),
  require('../../../assets/04-Foto.png'),
  require('../../../assets/05-Foto.png'),
];

const profileVariants: Record<string, string[]> = {
  Advogado: ['Advogado Júnior', 'Advogado Pleno', 'Advogado Sênior'],
  Analista: ['Analista Júnior', 'Analista Pleno', 'Analista Sênior'],
  Coordenador: ['Coordenador', 'Coordenador de Projetos', 'Coordenador Administrativo'],
};

function generate30Professionals(
  sectors: string[],
  areasBySector: Record<string, string[]>,
  profilesByArea: Record<string, string[]>
): GeneratedProfessional[] {
  // Cria a lista de combinações base válidas a partir dos props
  const baseCombos: Array<{ sector: string; area: string; profile: string; variants: string[] }> = [];
  sectors.forEach((sector) => {
    (areasBySector[sector] ?? []).forEach((area) => {
      (profilesByArea[area] ?? []).forEach((profile) => {
        const variants = profileVariants[profile] ?? [profile];
        variants.forEach((pv) => baseCombos.push({ sector, area, profile, variants: [pv] }));
      });
    });
  });

  // Se houver menos de 10 combos com variantes, duplicamos ciclicamente para atingir 10
  const targetComboCount = 10;
  const combos: Array<{ sector: string; area: string; profile: string; display: string }> = [];
  let ci = 0;
  while (combos.length < targetComboCount && baseCombos.length > 0) {
    const bc = baseCombos[ci % baseCombos.length];
    const display = bc.variants[0];
    combos.push({ sector: bc.sector, area: bc.area, profile: bc.profile, display });
    ci++;
  }

  const out: GeneratedProfessional[] = [];
  let nIdx = 0;
  let pIdx = 0;
  combos.forEach((c, comboIndex) => {
    for (let k = 0; k < 3; k++) {
      const id = `pro-${comboIndex + 1}-${k + 1}`;
      out.push({
        id,
        name: namesPool[nIdx++ % namesPool.length],
        photo: photosPool[pIdx++ % photosPool.length],
        sector: c.sector,
        area: c.area,
        profile: c.profile, // chave de filtro base
        profileDisplay: c.display, // rótulo rico para UI
      });
    }
  });
  return out.slice(0, 30);
}

const NewAppointmentFilterProfessionals: React.FC<FilterProfessionalsProps> = ({
  visible,
  onClose,
  onApply,
  sectors,
  areasBySector,
  profilesByArea,
  selectedSector,
  selectedArea,
  selectedProfile,
  professionals,
}) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Capitaliza apenas a primeira letra da primeira palavra, preservando espaços iniciais
  const capitalizeFirstWord = (text: string) => {
    if (!text) return text;
    const leading = text.match(/^\s*/)?.[0] ?? '';
    const rest = text.slice(leading.length);
    if (!rest) return text;
    return leading + rest.charAt(0).toUpperCase() + rest.slice(1);
  };

  const [sectorIdx, setSectorIdx] = useState<number>(0);
  const [areaIdx, setAreaIdx] = useState<number>(0);
  const [profileIdx, setProfileIdx] = useState<number>(0);

  // Utilitários para compor listas com "Todos/Todas" e evitar duplicados
  const uniq = (arr: string[]) => Array.from(new Set(arr));
  const allAreas = useMemo(() => uniq(Object.values(areasBySector).flat()), [areasBySector]);
  const allProfiles = useMemo(() => uniq(Object.values(profilesByArea).flat()), [profilesByArea]);
  const sectorsList = useMemo(() => ['Todos', ...sectors], [sectors]);

  // Inicializa índices com seleção atual
  useEffect(() => {
    if (selectedSector) {
      const si = sectorsList.findIndex((s) => s === selectedSector);
      setSectorIdx(si >= 0 ? si : 0);
    } else {
      setSectorIdx(0);
    }
  }, [selectedSector, sectorsList]);

  // Deriva listas dinâmicas conforme seleção corrente
  const currentSector = sectorsList[sectorIdx] ?? sectorsList[0];
  // Áreas encadeadas pelo setor: quando setor muda, restringe áreas ao setor
  const areasList = useMemo(() => {
    const allowedAreas = currentSector === 'Todos' ? allAreas : (areasBySector[currentSector] ?? []);
    return ['Todas', ...allowedAreas];
  }, [currentSector, allAreas, areasBySector]);

  useEffect(() => {
    const ai = selectedArea ? areasList.findIndex((a) => a === selectedArea) : 0;
    setAreaIdx(ai >= 0 ? ai : 0);
  }, [selectedArea, areasList]);

  const currentArea = areasList[areaIdx] ?? areasList[0];
  // Perfis encadeados por setor/área: restringe perfis conforme seleção
  const profilesList = useMemo(() => {
    const areasAllowed = currentSector === 'Todos' ? allAreas : (areasBySector[currentSector] ?? []);
    const profilesAllowed = currentArea === 'Todas'
      ? uniq(areasAllowed.flatMap((a) => profilesByArea[a] ?? []))
      : (profilesByArea[currentArea] ?? []);
    return ['Todos', ...profilesAllowed];
  }, [currentSector, currentArea, areasBySector, profilesByArea, allAreas]);

  useEffect(() => {
    const pi = selectedProfile ? profilesList.findIndex((p) => p === selectedProfile) : 0;
    setProfileIdx(pi >= 0 ? pi : 0);
  }, [selectedProfile, profilesList]);
  const currentProfile = profilesList[profileIdx] ?? profilesList[0];

  // Reseta seleções encadeadas ao mudar setor/área (cadeia Setor → Área → Perfil)
  useEffect(() => {
    // Ao trocar Setor, volta Área e Perfil para o índice 0 (Todas/Todos)
    setAreaIdx(0);
    setProfileIdx(0);
  }, [currentSector]);

  useEffect(() => {
    // Ao trocar Área, volta Perfil para o índice 0 (Todos)
    setProfileIdx(0);
  }, [currentArea]);

  // Lista base: usa os dados recebidos ou gera 30 profissionais caso a lista seja pequena
  const enrichedProfessionals = useMemo(() => {
    const base = Array.isArray(professionals) ? professionals : [];
    if (base.length >= 30) return base;
    try {
      return generate30Professionals(sectors, areasBySector, profilesByArea);
    } catch {
      return base; // fallback seguro
    }
  }, [professionals, sectors, areasBySector, profilesByArea]);

  const filteredItems = useMemo(() => {
    const normalize = (str: string) => str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
    const q = normalize(search);
    const matchProfile = (itemProfile: string, current: string) => {
      if (current === 'Todos' || !current) return true;
      const ip = normalize(itemProfile);
      const cp = normalize(current);
      return ip === cp || ip.startsWith(cp);
    };
    let list = enrichedProfessionals.filter(
      (p) =>
        (currentSector === 'Todos' || !currentSector || p.sector === currentSector) &&
        (currentArea === 'Todas' || !currentArea || p.area === currentArea) &&
        (currentProfile === 'Todos' || !currentProfile || matchProfile(p.profile, currentProfile))
    );
    if (q) {
      list = list.filter((i) => {
        const nameNorm = normalize(i.name);
        const profileNorm = normalize(i.profileDisplay ?? i.profile);
        return nameNorm.includes(q) || profileNorm.includes(q);
      });
    }
    return list;
  }, [enrichedProfessionals, search, currentSector, currentArea, currentProfile]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.title}>Filtro Avançado</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Fechar">
              <CloseXIcon />
            </TouchableOpacity>
          </View>

          {/* Bloco de filtros (Setores, Áreas, Perfis) */}
          <View style={styles.filtersList}>
            {/* Setores */}
            <View style={styles.filterGroup}>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Setores:&nbsp;</Text>
                <View style={styles.statusRow}>
                  <TouchableOpacity style={[styles.arrowBtn, styles.arrowBtnBlue]} onPress={() => setSectorIdx((i) => (i - 1 + sectorsList.length) % sectorsList.length)}>
                    <ArrowIcon />
                  </TouchableOpacity>
                  <View style={styles.counterBox}>
                    <Text style={styles.counterText}>{String(sectorIdx + 1).padStart(2, '0')}/{String(sectorsList.length).padStart(2, '0')}</Text>
                  </View>
                  <TouchableOpacity style={[styles.arrowBtn, styles.arrowBtnBlue, styles.arrowRight]} onPress={() => setSectorIdx((i) => (i + 1) % sectorsList.length)}>
                    <ArrowIcon />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.filterValueRow}>
                <Text style={styles.filterValue}>{currentSector}</Text>
                <View style={styles.separatorThin} />
              </View>
            </View>

            {/* Áreas */}
            <View style={styles.filterGroup}>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Áreas:&nbsp;</Text>
                <View style={styles.statusRow}>
                  <TouchableOpacity style={[styles.arrowBtn, styles.arrowBtnBlue]} onPress={() => setAreaIdx((i) => (i - 1 + areasList.length) % areasList.length)}>
                    <ArrowIcon />
                  </TouchableOpacity>
                  <View style={styles.counterBox}>
                    <Text style={styles.counterText}>{String(areaIdx + 1).padStart(2, '0')}/{String(areasList.length).padStart(2, '0')}</Text>
                  </View>
                  <TouchableOpacity style={[styles.arrowBtn, styles.arrowBtnBlue, styles.arrowRight]} onPress={() => setAreaIdx((i) => (i + 1) % areasList.length)}>
                    <ArrowIcon />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.filterValueRow}>
                <Text style={styles.filterValue}>{currentArea}</Text>
                <View style={styles.separatorThin} />
              </View>
            </View>

            {/* Perfis */}
            <View style={styles.filterGroup}>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Perfis:&nbsp;</Text>
                <View style={styles.statusRow}>
                  <TouchableOpacity style={[styles.arrowBtn, styles.arrowBtnBlue]} onPress={() => setProfileIdx((i) => (i - 1 + profilesList.length) % profilesList.length)}>
                    <ArrowIcon />
                  </TouchableOpacity>
                  <View style={styles.counterBox}>
                    <Text style={styles.counterText}>{String(profileIdx + 1).padStart(2, '0')}/{String(profilesList.length).padStart(2, '0')}</Text>
                  </View>
                  <TouchableOpacity style={[styles.arrowBtn, styles.arrowBtnBlue, styles.arrowRight]} onPress={() => setProfileIdx((i) => (i + 1) % profilesList.length)}>
                    <ArrowIcon />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.filterValueRow}>
                <Text style={styles.filterValue}>{currentProfile}</Text>
                <View style={styles.separatorThin} />
              </View>
            </View>
          </View>

          {/* Barra de busca */}
          <View style={styles.searchBar}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={(t) => setSearch(capitalizeFirstWord(t))}
              placeholder="Pesquise aqui"
              placeholderTextColor="#91929E"
              // Evita foco com contorno/outline padrão no web
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          {/* Lista de profissionais (Card conforme snippet fornecido) */}
          <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
            {filteredItems.map((item, idx) => (
              <View key={item.id} style={styles.cardContainer}>
                {/* Coluna da foto (79 x 170) */}
                <View style={styles.leftColumn}>
                  <View style={styles.leftImageBox}>
                    <Image source={item.photo} style={styles.leftImage} resizeMode="cover" />
                  </View>
                  {/* Overlay com rádio (79 x 40) */}
                  <TouchableOpacity
                    style={styles.leftOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedId((prev) => (prev === item.id ? null : item.id))}
                    accessibilityRole="button"
                    accessibilityLabel={`Selecionar ${item.name}`}
                  >
                    <View style={{ position: 'absolute', left: 30, top: 10 }}>
                      <RadioDot selected={selectedId === item.id} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Coluna da informação (flex) */}
                <TouchableOpacity style={styles.rightColumn} activeOpacity={1} onPress={() => setSelectedId(item.id)} accessibilityRole="button" accessibilityLabel={`Selecionar ${item.name}`}>
                  {/* Nome */}
                  <View style={styles.nameRow}><Text style={styles.nameText}>{item.name}</Text></View>
                  {/* linha */}
                  <View style={styles.thinLine} />
                  {/* Setor */}
                  <View style={styles.infoGroup}>
                    <View style={styles.labelRow}><Text style={styles.labelText}>Setor:</Text></View>
                    <View style={styles.valueRow}><Text style={styles.valueText}>{item.sector}</Text></View>
                  </View>
                  <View style={styles.thinLine} />
                  {/* Área */}
                  <View style={styles.infoGroup}>
                    <View style={styles.labelRow}><Text style={styles.labelText}>Área:</Text></View>
                    <View style={styles.valueRow}><Text style={styles.valueText}>{item.area}</Text></View>
                  </View>
                  <View style={styles.thinLine} />
                  {/* Perfil */}
                  <View style={styles.infoGroup}>
                    <View style={styles.labelRow}><Text style={styles.labelText}>Perfil:</Text></View>
                    <View style={styles.valueRow}><Text style={styles.valueText}>{item.profileDisplay ?? item.profile}</Text></View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Rodapé com botões */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => onApply({
                sector: currentSector,
                area: currentArea,
                profile: currentProfile,
                selectedProfessionalId: selectedId,
              })}
            >
              <Text style={styles.applyText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  // Modal ocupa largura/altura máxima, com 15px de margem de respiro
  container: {
    position: 'absolute',
    top: 15,
    bottom: 15,
    left: 15,
    right: 15,
    backgroundColor: '#FCFCFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    padding: 15,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#3A3F51' },
  closeButton: { width: 38, height: 38, borderRadius: 8, backgroundColor: '#F4F4F4', alignItems: 'center', justifyContent: 'center' },
  filtersList: { marginTop: 6 },
  filterGroup: { marginBottom: 20 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterLabel: { width: 174, color: '#7D8592', fontSize: 14, fontFamily: 'Inter_400Regular' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  arrowBtn: { width: 30, height: 25, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  arrowBtnBlue: { backgroundColor: '#1777CF' },
  arrowRight: { transform: [{ rotate: '180deg' }] },
  counterBox: { width: 67, height: 25, borderWidth: 1, borderColor: '#D8E0F0', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  counterText: { width: 51, textAlign: 'center', color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_500Medium' },
  filterValueRow: { marginTop: 10 },
  filterValue: { color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_500Medium' },
  separatorThin: { width: '100%', height: 1, backgroundColor: '#E5E7EB', marginTop: 5 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 35,
    marginTop: 0,
  },
  searchInput: {
    flex: 1,
    color: '#3A3F51',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    borderWidth: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none', outlineWidth: 0, outlineColor: 'transparent' } : {}),
  },

  list: { marginTop: 10 },
  // Card ocupa toda a largura disponível do modal
  cardContainer: {
    width: '100%',
    alignSelf: 'stretch',
    height: 172,
    paddingLeft: 5,
    paddingRight: 10,
    borderRadius: 8,
    borderWidth: 0.005,
    borderColor: '#D8E0F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FCFCFC',
    marginBottom: 12,
  },
  leftColumn: {
    width: 79,
    height: 170,
    paddingTop: 5,
    paddingBottom: 5,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  leftImageBox: { flex: 1, borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  leftImage: { width: '100%', height: '100%' },
  leftOverlay: {
    position: 'absolute',
    left: 0,
    top: 125,
    width: 79,
    height: 40,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(252,252,252,0.80)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  rightColumn: { flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 5 },
  nameRow: { height: 17, alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 9 },
  nameText: { flex: 1, color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_500Medium' },
  thinLine: { height: 0.5, backgroundColor: '#D8E0F0', alignSelf: 'stretch' },
  infoGroup: { alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 3 },
  labelRow: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center' },
  labelText: { flex: 1, color: '#7D8592', fontSize: 12, fontFamily: 'Inter_500Medium' },
  valueRow: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center' },
  valueText: { flex: 1, color: '#7D8592', fontSize: 14, fontFamily: 'Inter_400Regular' },

  footerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 15, marginTop: 15 },
  cancelButton: { width: 149, height: 35, borderRadius: 6, borderWidth: 1, borderColor: '#D8E0F0', backgroundColor: '#F4F4F4', alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#3A3F51' },
  applyButton: { flex: 1, height: 35, borderRadius: 6, borderWidth: 1, borderColor: '#D8E0F0', backgroundColor: '#1777CF', alignItems: 'center', justifyContent: 'center' },
  applyText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#FCFCFC' },
});

export default NewAppointmentFilterProfessionals;