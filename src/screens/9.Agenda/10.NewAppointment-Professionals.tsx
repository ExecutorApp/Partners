import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import FullFlow from './13.FullFlow';
import NewAppointmentFilterProfessionals from './11.NewAppointment-FilterProfessionals';
import SlideInView from './SlideInView';
// DateTime será exibida pelo fluxo principal (CalendarHomeScreen),
// então removemos a abertura interna desta tela.
// Dados mínimos locais para manter filtros e lista funcionando sem ./data.
type Professional = {
  id: string;
  name: string;
  role: string;
  sector: string;
  area: string;
  profile: string;
  profileDisplay?: string;
  photo: any;
};

const sectors: string[] = ['Direção', 'Comercial', 'Operacional'];
const areasBySector: Record<string, string[]> = {
  Direção: ['Estratégica', 'Técnica'],
  Comercial: ['Time Interno', 'Time Externo (Partners)'],
  Operacional: ['Jurídico', 'Administrativo', 'Atendimento ao Cliente'],
};
const profilesByArea: Record<string, string[]> = {
  Estratégica: ['Gestor de Projeto'],
  Técnica: ['Expert'],
  'Time Interno': ['SDR (pré-venda)', 'Closer (Fechador de contrato)', 'Gestor Comercial'],
  'Time Externo (Partners)': ['Partner (Perceiro comercial externo)', 'Gestor Comercial'],
  Jurídico: ['Estagiário', 'Paralegal Júnior', 'Paralegal Pleno', 'Paralegal Sênior', 'Advogado Júnior', 'Advogado Pleno', 'Advogado Sênior', 'Gestor Jurídico'],
  Administrativo: ['Assistente Administrativo', 'Controle de Documentos', 'Gestor Administrativo'],
  'Atendimento ao Cliente': ['Assistente de Relacionamento', 'Suporte ao Cliente', 'Gestor de Atendimento'],
};

const professionalsData: Professional[] = [
  { id: 'p1', name: 'Ana Souza', role: 'Advogada', sector: 'Jurídico', area: 'Cível', profile: 'Advogado', photo: require('../../../assets/01-Foto.png') },
  { id: 'p2', name: 'Bruno Lima', role: 'Analista', sector: 'Operacional', area: 'Jurídico', profile: 'Analista', photo: require('../../../assets/02-Foto.png') },
  { id: 'p3', name: 'Carla Mendes', role: 'Coordenadora', sector: 'Operacional', area: 'Financeiro', profile: 'Coordenador', photo: require('../../../assets/03-Foto.png') },
  { id: 'p4', name: 'Diego Alves', role: 'Advogado', sector: 'Jurídico', area: 'Trabalhista', profile: 'Advogado', photo: require('../../../assets/04-Foto.png') },
];

// ---------- Geração de 30 profissionais (mesma lógica do modal de filtros) ----------
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
  'SDR (pré-venda)': ['SDR (pré-venda)'],
  'Closer (Fechador de contrato)': ['Closer (Fechador de contrato)'],
  'Gestor Comercial': ['Gestor Comercial'],
  'Partner (Perceiro comercial externo)': ['Partner (Perceiro comercial externo)'],
  'Gestor Jurídico': ['Gestor Jurídico'],
  'Assistente Administrativo': ['Assistente Administrativo'],
  'Controle de Documentos': ['Controle de Documentos'],
  'Gestor Administrativo': ['Gestor Administrativo'],
  'Assistente de Relacionamento': ['Assistente de Relacionamento'],
  'Suporte ao Cliente': ['Suporte ao Cliente'],
  'Gestor de Atendimento': ['Gestor de Atendimento'],
  'Gestor de Projeto': ['Gestor de Projeto'],
  Expert: ['Expert'],
};

function generate30Professionals(
  sectors: string[],
  areasBySector: Record<string, string[]>,
  profilesByArea: Record<string, string[]>
): Professional[] {
  const baseCombos: Array<{ sector: string; area: string; profile: string; variants: string[] }> = [];
  sectors.forEach((sector) => {
    (areasBySector[sector] ?? []).forEach((area) => {
      (profilesByArea[area] ?? []).forEach((profile) => {
        const variants = profileVariants[profile] ?? [profile];
        variants.forEach((pv) => baseCombos.push({ sector, area, profile, variants: [pv] }));
      });
    });
  });

  const targetComboCount = 10;
  const combos: Array<{ sector: string; area: string; profile: string; display: string }> = [];
  let ci = 0;
  while (combos.length < targetComboCount && baseCombos.length > 0) {
    const bc = baseCombos[ci % baseCombos.length];
    const display = bc.variants[0];
    combos.push({ sector: bc.sector, area: bc.area, profile: bc.profile, display });
    ci++;
  }

  const out: Professional[] = [];
  let nIdx = 0;
  let pIdx = 0;
  combos.forEach((c, comboIndex) => {
    for (let k = 0; k < 3; k++) {
      const id = `pro-${comboIndex + 1}-${k + 1}`;
      out.push({
        id,
        name: namesPool[nIdx++ % namesPool.length],
        role: c.profile,
        photo: photosPool[pIdx++ % photosPool.length],
        sector: c.sector,
        area: c.area,
        profile: c.profile,
        profileDisplay: c.display,
      });
    }
  });
  return out.slice(0, 30);
}

interface NewAppointmentProfessionalsProps {
  visible: boolean;
  onClose: () => void;
  onBack?: () => void;
  onNext?: (professionalId?: string | null) => void;
  onSelectProfessional?: (professionalId: string | null) => void;
  summaries?: Partial<Record<number, string>>;
  onSelectStep?: (index: number) => void;
  onUpdateSummary?: (step: number, value: string) => void;
  maxAccessibleStep?: number;
  transitionDirection?: 'forward' | 'backward';
  embedded?: boolean;
  registerNextHandler?: (handler: () => void) => void;
  onCanProceedChange?: (canProceed: boolean) => void;
}

// Ícone Olho (visualização) – original do Figma com fill #3A3F51
const EyeIcon: React.FC = () => (
  <Svg width={23} height={14} viewBox="0 0 23 14" fill="none">
    <Path d="M11.5 0C5.46878 0 0.364891 6.3 0.149234 6.573C0.0524697 6.6954 0 6.84553 0 7C0 7.15447 0.0524697 7.3046 0.149234 7.427C0.364891 7.7 5.46878 14 11.5 14C17.5312 14 22.6351 7.7 22.8508 7.427C22.9475 7.3046 23 7.15447 23 7C23 6.84553 22.9475 6.6954 22.8508 6.573C22.6351 6.3 17.5312 0 11.5 0ZM11.5 12.6C7.02152 12.6 2.87371 8.4 1.65165 7C2.87371 5.6 7.01433 1.4 11.5 1.4C15.9857 1.4 20.1263 5.6 21.3484 7C20.1263 8.4 15.9857 12.6 11.5 12.6Z" fill="#3A3F51"/>
    <Path d="M15.0943 6.3C15.2129 6.29991 15.3297 6.27122 15.4342 6.21649C15.5387 6.16176 15.6277 6.0827 15.6932 5.98635C15.7586 5.89001 15.7986 5.77937 15.8095 5.66433C15.8204 5.54928 15.8019 5.43339 15.7556 5.327C15.3602 4.56023 14.7517 3.9169 13.9994 3.47018C13.2471 3.02345 12.3811 2.79126 11.5 2.8C10.3561 2.8 9.25902 3.2425 8.45014 4.03015C7.64127 4.8178 7.18685 5.88609 7.18685 7C7.18685 8.11391 7.64127 9.1822 8.45014 9.96985C9.25902 10.7575 10.3561 11.2 11.5 11.2C12.3811 11.2087 13.2471 10.9765 13.9994 10.5298C14.7517 10.0831 15.3602 9.43977 15.7556 8.673C15.8019 8.56661 15.8204 8.45072 15.8095 8.33568C15.7986 8.22063 15.7586 8.11 15.6932 8.01365C15.6277 7.9173 15.5387 7.83824 15.4342 7.78351C15.3297 7.72879 15.2129 7.7001 15.0943 7.7C14.9974 7.7099 14.8994 7.6986 14.8076 7.66692C14.7158 7.63525 14.6324 7.58399 14.5635 7.51691C14.4946 7.44982 14.4419 7.36859 14.4094 7.27916C14.3769 7.18973 14.3653 7.09436 14.3754 7C14.3653 6.90564 14.3769 6.81027 14.4094 6.72084C14.4419 6.63141 14.4946 6.55018 14.5635 6.48309C14.6324 6.41601 14.7158 6.36475 14.8076 6.33308C14.8994 6.3014 14.9974 6.2901 15.0943 6.3Z" fill="#3A3F51"/>
  </Svg>
);

// Ícone X (fechar) – original do Figma com fill #3A3F51
const CloseIcon: React.FC = () => (
  <Svg width={13} height={12} viewBox="0 0 13 12" fill="none">
    <Path d="M12.655 0.247926C12.2959 -0.0821192 11.7339 -0.0827124 11.374 0.246573L6.5 4.70646L1.62595 0.246573C1.26609 -0.0827126 0.704125 -0.0821187 0.344999 0.247926L0.291597 0.297004C-0.0977822 0.654853 -0.0971065 1.25701 0.293074 1.61404L5.08634 6L0.293074 10.386C-0.0971063 10.743 -0.0977808 11.3451 0.291598 11.703L0.345 11.7521C0.704126 12.0821 1.26609 12.0827 1.62595 11.7534L6.5 7.29354L11.374 11.7534C11.7339 12.0827 12.2959 12.0821 12.655 11.7521L12.7084 11.703C13.0978 11.3451 13.0971 10.743 12.7069 10.386L7.91366 6L12.7069 1.61404C13.0971 1.25701 13.0978 0.654853 12.7084 0.297004L12.655 0.247926Z" fill="#3A3F51"/>
  </Svg>
);

// Ícone de busca (SVG fornecido)
const SearchIcon: React.FC = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path
      d="M15 15L11.6556 11.6556M13.4444 7.22222C13.4444 10.6587 10.6587 13.4444 7.22222 13.4444C3.78578 13.4444 1 10.6587 1 7.22222C1 3.78578 3.78578 1 7.22222 1C10.6587 1 13.4444 3.78578 13.4444 7.22222Z"
      stroke="#7D8592"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Formata para deixar a primeira letra da primeira palavra em maiúscula
const capitalizeFirstLetter = (s: string) => {
  if (!s) return s;
  return s.replace(/^(\s*)([a-zA-ZÀ-ÖØ-öø-ÿ])/u, (_, spaces: string, letter: string) => spaces + letter.toUpperCase());
};

// Radio – padrão visual
const RadioIcon = ({ selected }: { selected: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z"
      fill={selected ? '#1777CF' : '#6F7DA0'}
      stroke="#FCFCFC"
    />
    {selected ? <Path d="M10 5a5 5 0 100 10 5 5 0 000-10z" fill="#1777CF"/> : null}
  </Svg>
);

// RadioDot – mesmo padrão visual do modal de filtros (11.NewAppointment-FilterProfessionals.tsx)
const RadioDot: React.FC<{ selected?: boolean }> = ({ selected }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    {selected ? (
      <>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z"
          fill="#1777CF"
        />
        <Path d="M5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10Z" fill="#1777CF" />
      </>
    ) : (
      // borda inativa mais encorpada, sem stroke branco
      <Circle cx={10} cy={10} r={8} stroke="#6F7DA0" strokeWidth={1.5} fill="none" />
    )}
  </Svg>
);

const NewAppointmentProfessionals: React.FC<NewAppointmentProfessionalsProps> = ({ visible, transitionDirection = 'forward', onClose, onBack, onNext, onSelectProfessional, summaries, onSelectStep, onUpdateSummary, maxAccessibleStep = 1, embedded = false, registerNextHandler, onCanProceedChange }) => {
  const professionals: Professional[] = useMemo(() => professionalsData, []);

  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [fullFlowVisible, setFullFlowVisible] = useState<boolean>(false);
  const [filtersVisible, setFiltersVisible] = useState<boolean>(false);
  // A DateTime será aberta pelo fluxo principal (etapa 7)
  const [selectedSector, setSelectedSector] = useState<string>('Todos');
  const [selectedArea, setSelectedArea] = useState<string>('Todas');
  const [selectedProfile, setSelectedProfile] = useState<string>('Todos');

  const isBackDisabled = false; // Na referência, botão Voltar aparece ativo
  const isNextDisabled = useMemo(() => selectedProfessional === null, [selectedProfessional]);
  // Notifica rodapé unificado sobre possibilidade de prosseguir
  useEffect(() => {
    onCanProceedChange?.(!isNextDisabled);
  }, [isNextDisabled, onCanProceedChange]);
  // Registra handler do botão "Próximo" quando em modo embed
  useEffect(() => {
    if (!embedded || !registerNextHandler) return;
    registerNextHandler(() => {
      if (!isNextDisabled) {
        onNext?.(selectedProfessional);
      }
    });
  }, [embedded, registerNextHandler, isNextDisabled, selectedProfessional, onNext]);

  // Seleção padrão: Nenhum (ao abrir a etapa)
  useEffect(() => {
    if (visible) {
      setSelectedProfessional(null);
      onSelectProfessional?.(null);
      onUpdateSummary?.(6, 'Nenhum');
      console.log('[Professionals] Tela visível: resumo(6) -> Nenhum');
    }
  }, [visible]);

  // Normalização para busca: remove acentos e compara em minúsculas
  const normalizeText = (str: string) => str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const enrichedProfessionals = useMemo(() => {
    const base = Array.isArray(professionals) ? professionals : [];
    if (base.length >= 30) return base;
    try {
      return generate30Professionals(sectors, areasBySector, profilesByArea);
    } catch {
      return base; // fallback seguro
    }
  }, [professionals]);

  const filteredProfessionals = useMemo(() => {
    const sText = normalizeText(search);
    let base = enrichedProfessionals;
    if (selectedSector && selectedSector !== 'Todos') base = base.filter((p) => p.sector === selectedSector);
    if (selectedArea && selectedArea !== 'Todas') base = base.filter((p) => p.area === selectedArea);
    if (selectedProfile && selectedProfile !== 'Todos') base = base.filter((p) => p.profile === selectedProfile);
    if (!sText) return base;
    return base.filter((p) => {
      const nameNorm = normalizeText(p.name);
      const roleNorm = normalizeText(p.role);
      const profileNorm = normalizeText(p.profileDisplay ?? p.profile);
      return nameNorm.includes(sText) || roleNorm.includes(sText) || profileNorm.includes(sText);
    });
  }, [search, enrichedProfessionals, selectedSector, selectedArea, selectedProfile]);

  const handleSelectNone = () => {
    setSelectedProfessional(null);
    onSelectProfessional?.(null);
    onUpdateSummary?.(6, 'Nenhum');
    console.log('[Professionals] Selecionado: Nenhum');
  };

  const handleSelectProfessional = (id: string) => {
    setSelectedProfessional(id);
    onSelectProfessional?.(id);
    const item = enrichedProfessionals.find((p) => p.id === id);
    onUpdateSummary?.(6, item?.name ?? id);
    console.log('[Professionals] Selecionado:', id, '->', item?.name ?? id);
  };

  // Renderização apenas do conteúdo central quando embed=true (sem cabeçalho/rodapé)
  if (embedded) {
    return (
      <>
      <SlideInView visible={visible} direction={transitionDirection} style={{ alignSelf: 'stretch', flex: 1 }}>
        <View style={styles.contentFlex}>
          {/* Bloco introdutório */}
          <View style={styles.introContainer}>
            <View style={styles.centerBlock}>
              <Text style={styles.sectionTitle}>Profissionais</Text>
              <Text style={styles.sectionSubtitle}>Selecione um profissional para continuar</Text>
            </View>

            {/* Indicador de passos (7 passos, 1–6 ativos) */}
            <View style={styles.stepsRow}>
              {Array.from({ length: 7 }).map((_, i) => (
                <View key={i} style={[styles.stepDot, i < 6 ? styles.stepDotActive : styles.stepDotInactive]} />
              ))}
            </View>
          </View>

          {/* Filtros (carrossel horizontal: Setores, Áreas, Perfis) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            <TouchableOpacity style={styles.filterCard} accessibilityRole="button" accessibilityLabel="Filtro Setores" onPress={() => setFiltersVisible(true)}>
              <Text style={styles.filterLabel}>Setores</Text>
              <Text style={styles.filterValue}>{selectedSector}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterCard} accessibilityRole="button" accessibilityLabel="Filtro Áreas" onPress={() => setFiltersVisible(true)}>
              <Text style={styles.filterLabel}>Áreas</Text>
              <Text style={styles.filterValue}>{selectedArea}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterCard} accessibilityRole="button" accessibilityLabel="Filtro Perfis" onPress={() => setFiltersVisible(true)}>
              <Text style={styles.filterLabel}>Perfis</Text>
              <Text style={styles.filterValue}>{selectedProfile ?? 'Todos'}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Busca */}
          <View style={styles.searchRow}>
            <View style={styles.searchIconWrap}><SearchIcon /></View>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={(text) => setSearch(capitalizeFirstLetter(text))}
              placeholder="pesquise aqui"
              placeholderTextColor="#91929E"
              cursorColor="#1777CF"
              selectionColor="#1777CF"
            />
          </View>

          {/* Nenhum */}
          <TouchableOpacity style={styles.noneRow} onPress={handleSelectNone} accessibilityRole="button" accessibilityLabel="Selecionar nenhum">
            <RadioIcon selected={selectedProfessional === null} />
            <Text style={styles.noneLabel}>Nenhum</Text>
          </TouchableOpacity>
          <View style={styles.listDivider} />

          {/* Lista de profissionais (Card conforme snippet) */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filteredProfessionals.map((p) => (
              <View key={p.id} style={styles.cardContainer}>
                {/* Coluna esquerda da foto */}
                <View style={styles.leftColumn}>
                  <View style={styles.leftImageBox}>
                    <Image source={p.photo} style={styles.leftImage} resizeMode="cover" />
                  </View>
                  {/* Overlay rádio (mesmo comportamento do modal) */}
                  <TouchableOpacity
                    style={styles.leftOverlay}
                    activeOpacity={1}
                    onPress={() => {
                      if (selectedProfessional === p.id) {
                        handleSelectNone();
                      } else {
                        handleSelectProfessional(p.id);
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Selecionar ${p.name}`}
                  >
                    <View style={{ position: 'absolute', left: 30, top: 10 }}>
                      <RadioDot selected={selectedProfessional === p.id} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Coluna direita com info */}
                <TouchableOpacity style={styles.rightColumn} onPress={() => handleSelectProfessional(p.id)} accessibilityRole="button" accessibilityLabel={`Selecionar ${p.name}`}>
                  <View style={styles.nameRow}><Text style={styles.nameText}>{p.name}</Text></View>
                  <View style={styles.thinLine} />
                  <View style={styles.infoGroup}>
                    <View style={styles.labelRow}><Text style={styles.labelText}>Setor:</Text></View>
                    <View style={styles.valueRow}><Text style={styles.valueText}>{p.sector}</Text></View>
                  </View>
                  <View style={styles.thinLine} />
                  <View style={styles.infoGroup}>
                    <View style={styles.labelRow}><Text style={styles.labelText}>Área:</Text></View>
                    <View style={styles.valueRow}><Text style={styles.valueText}>{p.area}</Text></View>
                  </View>
                  <View style={styles.thinLine} />
                  <View style={styles.infoGroup}>
                    <View style={styles.labelRow}><Text style={styles.labelText}>Perfil:</Text></View>
                    <View style={styles.valueRow}><Text style={styles.valueText}>{p.profileDisplay ?? p.profile}</Text></View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </SlideInView>
      <NewAppointmentFilterProfessionals
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        onApply={({ sector, area, profile, selectedProfessionalId }) => {
          if (sector) setSelectedSector(sector);
          if (area) setSelectedArea(area);
          setSelectedProfile(profile);
          if (selectedProfessionalId) {
            setSelectedProfessional(selectedProfessionalId);
            onSelectProfessional?.(selectedProfessionalId);
            const item = enrichedProfessionals.find((p) => p.id === selectedProfessionalId);
            onUpdateSummary?.(6, item?.name ?? selectedProfessionalId);
            console.log('[FilterProfessionals] Aplicado:', selectedProfessionalId, '->', item?.name ?? selectedProfessionalId);
          }
          setFiltersVisible(false);
        }}
        sectors={sectors}
        areasBySector={areasBySector}
        profilesByArea={profilesByArea}
        selectedSector={selectedSector}
        selectedArea={selectedArea}
        selectedProfile={selectedProfile}
        professionals={professionals}
      />
      </>
    );
  }

  return (
    <>
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Cabeçalho */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Novo agendamento</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={() => setFullFlowVisible(true)} accessibilityRole="button" accessibilityLabel="Visualizar">
                <EyeIcon />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar">
                <CloseIcon />
              </TouchableOpacity>
            </View>
          </View>

          {/* Conteúdo central */}
        <SlideInView visible={visible} direction={transitionDirection} style={{ alignSelf: 'stretch', flex: 1 }}>
          <View style={styles.contentFlex}>
            {/* Bloco introdutório */}
            <View style={styles.introContainer}>
              <View style={styles.centerBlock}>
                <Text style={styles.sectionTitle}>Profissionais</Text>
                <Text style={styles.sectionSubtitle}>Selecione um profissional para continuar</Text>
              </View>

              {/* Indicador de passos (7 passos, 1–6 ativos) */}
              <View style={styles.stepsRow}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <View key={i} style={[styles.stepDot, i < 6 ? styles.stepDotActive : styles.stepDotInactive]} />
                ))}
              </View>
            </View>

            {/* Filtros (carrossel horizontal: Setores, Áreas, Perfis) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersRow}
            >
              <TouchableOpacity style={styles.filterCard} accessibilityRole="button" accessibilityLabel="Filtro Setores" onPress={() => setFiltersVisible(true)}>
                <Text style={styles.filterLabel}>Setores</Text>
                <Text style={styles.filterValue}>{selectedSector}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterCard} accessibilityRole="button" accessibilityLabel="Filtro Áreas" onPress={() => setFiltersVisible(true)}>
                <Text style={styles.filterLabel}>Áreas</Text>
                <Text style={styles.filterValue}>{selectedArea}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterCard} accessibilityRole="button" accessibilityLabel="Filtro Perfis" onPress={() => setFiltersVisible(true)}>
                <Text style={styles.filterLabel}>Perfis</Text>
                <Text style={styles.filterValue}>{selectedProfile ?? 'Todos'}</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Busca */}
            <View style={styles.searchRow}>
              <View style={styles.searchIconWrap}><SearchIcon /></View>
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={(text) => setSearch(capitalizeFirstLetter(text))}
                placeholder="pesquise aqui"
                placeholderTextColor="#91929E"
                cursorColor="#1777CF"
                selectionColor="#1777CF"
              />
            </View>

            {/* Nenhum */}
            <TouchableOpacity style={styles.noneRow} onPress={handleSelectNone} accessibilityRole="button" accessibilityLabel="Selecionar nenhum">
              <RadioIcon selected={selectedProfessional === null} />
              <Text style={styles.noneLabel}>Nenhum</Text>
            </TouchableOpacity>
            <View style={styles.listDivider} />

            {/* Lista de profissionais (Card conforme snippet) */}
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {filteredProfessionals.map((p) => (
                <View key={p.id} style={styles.cardContainer}>
                  {/* Coluna esquerda da foto */}
                  <View style={styles.leftColumn}>
                    <View style={styles.leftImageBox}>
                      <Image source={p.photo} style={styles.leftImage} resizeMode="cover" />
                    </View>
                    {/* Overlay rádio (mesmo comportamento do modal) */}
                    <TouchableOpacity
                      style={styles.leftOverlay}
                      activeOpacity={1}
                      onPress={() => {
                        if (selectedProfessional === p.id) {
                          handleSelectNone();
                        } else {
                          handleSelectProfessional(p.id);
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Selecionar ${p.name}`}
                    >
                      <View style={{ position: 'absolute', left: 30, top: 10 }}>
                        <RadioDot selected={selectedProfessional === p.id} />
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Coluna direita com info */}
                  <TouchableOpacity style={styles.rightColumn} onPress={() => handleSelectProfessional(p.id)} accessibilityRole="button" accessibilityLabel={`Selecionar ${p.name}`}>
                    <View style={styles.nameRow}><Text style={styles.nameText}>{p.name}</Text></View>
                    <View style={styles.thinLine} />
                    <View style={styles.infoGroup}>
                      <View style={styles.labelRow}><Text style={styles.labelText}>Setor:</Text></View>
                      <View style={styles.valueRow}><Text style={styles.valueText}>{p.sector}</Text></View>
                    </View>
                    <View style={styles.thinLine} />
                    <View style={styles.infoGroup}>
                      <View style={styles.labelRow}><Text style={styles.labelText}>Área:</Text></View>
                      <View style={styles.valueRow}><Text style={styles.valueText}>{p.area}</Text></View>
                    </View>
                    <View style={styles.thinLine} />
                    <View style={styles.infoGroup}>
                      <View style={styles.labelRow}><Text style={styles.labelText}>Perfil:</Text></View>
                      <View style={styles.valueRow}><Text style={styles.valueText}>{p.profileDisplay ?? p.profile}</Text></View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
          </SlideInView>

          {/* Rodapé */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.footerButton, isBackDisabled && styles.footerButtonDisabled]}
              onPress={onBack ?? onClose}
              disabled={isBackDisabled}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              accessibilityState={{ disabled: isBackDisabled }}
            >
              <Text style={styles.footerButtonText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.footerButtonPrimary, isNextDisabled && styles.footerButtonDisabled]}
              disabled={isNextDisabled}
              accessibilityRole="button"
              accessibilityLabel="Próximo"
              accessibilityState={{ disabled: isNextDisabled }}
              onPress={() => {
                if (selectedProfessional !== null) {
                  onNext?.(selectedProfessional);
                }
              }}
            >
              <Text style={[styles.footerButtonText, styles.footerButtonTextPrimary]}>Próximo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    <NewAppointmentFilterProfessionals
      visible={filtersVisible}
      onClose={() => setFiltersVisible(false)}
      onApply={({ sector, area, profile, selectedProfessionalId }) => {
        if (sector) setSelectedSector(sector);
        if (area) setSelectedArea(area);
        setSelectedProfile(profile);
        if (selectedProfessionalId) {
          setSelectedProfessional(selectedProfessionalId);
          onSelectProfessional?.(selectedProfessionalId);
          const item = enrichedProfessionals.find((p) => p.id === selectedProfessionalId);
          onUpdateSummary?.(6, item?.name ?? selectedProfessionalId);
          console.log('[FilterProfessionals] Aplicado:', selectedProfessionalId, '->', item?.name ?? selectedProfessionalId);
        }
        setFiltersVisible(false);
      }}
      sectors={sectors}
      areasBySector={areasBySector}
      profilesByArea={profilesByArea}
      selectedSector={selectedSector}
      selectedArea={selectedArea}
      selectedProfile={selectedProfile}
      professionals={professionals}
    />
    <FullFlow visible={fullFlowVisible} onClose={() => setFullFlowVisible(false)} currentStep={6} summaries={summaries} onSelectStep={onSelectStep} maxAccessibleStep={maxAccessibleStep} />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    position: 'absolute',
    top: 15,
    bottom: 15,
    left: 15,
    right: 15,
    backgroundColor: '#FCFCFC',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0.12 : 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    color: '#3A3F51',
    fontFamily: 'Inter_700Bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBlock: {
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7D8592',
    fontFamily: 'Inter_400Regular',
    marginTop: 6,
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    marginTop: 14,
  },
  introContainer: {
    alignSelf: 'stretch',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
    flex: 1,
    minWidth: 24,
  },
  stepDotActive: {
    backgroundColor: '#1777CF',
  },
  stepDotInactive: {
    backgroundColor: '#E5E7EB',
  },
  // Filtros
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'stretch',
    marginTop: 14,
    paddingRight: 4,
    // Garante que os filtros fiquem acima de elementos seguintes
    position: 'relative',
  },
  filterCard: {
    flex: 0,
    minWidth: 140,
    height: 62,
    flexShrink: 0,
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterLabel: {
    fontSize: 12,
    color: '#7D8592',
    fontFamily: 'Inter_500Medium',
  },
  filterValue: {
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
    marginTop: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // Evita sobrepor os filtros; mantém espaçamento natural
    marginTop: -410,
  },
  searchIconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
    ...(Platform.OS === 'web'
      ? ({ outlineStyle: 'none', outlineWidth: 0, outlineColor: 'transparent' } as any)
      : {}),
  },
  noneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 5,
  },
  noneLabel: {
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
  },
  listDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  list: {
    flex: 1,
  },
  contentFlex: {
    flex: 1,
    alignSelf: 'stretch',
  },
  // Card conforme snippet (mesmo conjunto de estilos do filtro)
  cardContainer: {
    width: '100%',
    alignSelf: 'stretch',
    height: 170,
    paddingLeft: 5,
    paddingRight: 10,
    borderRadius: 8,
    borderWidth: 1,
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
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 10,
  },
  footerButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonDisabled: {
    opacity: 0.5,
    ...(Platform.OS === 'web' ? ({ cursor: 'not-allowed' } as any) : {}),
  },
  footerButtonPrimary: {
    backgroundColor: '#1777CF',
    borderColor: '#1777CF',
  },
  footerButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#3A3F51',
  },
  footerButtonTextPrimary: {
    color: '#FCFCFC',
  },
});

export default NewAppointmentProfessionals;