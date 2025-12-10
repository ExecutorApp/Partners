import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';

// Estrutura de dados baseada em CreateContactPayload (5.NewAppointment-CreateContact.tsx)
type ReadOnlyContactData = {
  personType?: 'FISICA' | 'JURIDICA';
  // PF
  name?: string;
  cpf?: string;
  // PJ
  companyName?: string;
  cnpj?: string;
  responsibleName?: string;
  responsibleCPF?: string;
  // Comuns
  email?: string;
  whatsapp?: string;
  state?: string; // UF (ex.: 'SP')
  cep?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  number?: string;
  complement?: string;
  photoUri?: string | null;
};

interface SchedulingDetailsPersonalDataProps {
  data?: ReadOnlyContactData;
}

// Lista de estados com rótulos (para exibir o label amigável)
const BRAZIL_STATES: string[] = [
  'AC - Acre',
  'AL - Alagoas',
  'AP - Amapá',
  'AM - Amazonas',
  'BA - Bahia',
  'CE - Ceará',
  'DF - Distrito Federal',
  'ES - Espírito Santo',
  'GO - Goiás',
  'MA - Maranhão',
  'MT - Mato Grosso',
  'MS - Mato Grosso do Sul',
  'MG - Minas Gerais',
  'PA - Pará',
  'PB - Paraíba',
  'PR - Paraná',
  'PE - Pernambuco',
  'PI - Piauí',
  'RJ - Rio de Janeiro',
  'RN - Rio Grande do Norte',
  'RS - Rio Grande do Sul',
  'RO - Rondônia',
  'RR - Roraima',
  'SC - Santa Catarina',
  'SP - São Paulo',
  'SE - Sergipe',
  'TO - Tocantins',
];
const UF_NAME_MAP: Record<string, string> = BRAZIL_STATES.reduce((acc, label) => {
  const [uf] = label.split(' - ');
  acc[uf] = label;
  return acc;
}, {} as Record<string, string>);

const SchedulingDetailsPersonalData: React.FC<SchedulingDetailsPersonalDataProps> = ({ data }) => {
  // Valores padrão para exibição
  const pd: ReadOnlyContactData = {
    personType: data?.personType ?? 'FISICA',
    name: data?.name ?? 'Antônio da Silva',
    cpf: data?.cpf ?? '000.111.222-33',
    companyName: data?.companyName ?? 'Empresa Exemplo LTDA',
    cnpj: data?.cnpj ?? '00.000.000/0000-00',
    responsibleName: data?.responsibleName ?? 'Responsável Exemplo',
    responsibleCPF: data?.responsibleCPF ?? '000.111.222-33',
    email: data?.email ?? 'perola@email.com',
    whatsapp: data?.whatsapp ?? '(11) 99999-0000',
    state: data?.state ?? 'SP',
    cep: data?.cep ?? '00000-000',
    city: data?.city ?? 'São Paulo',
    neighborhood: data?.neighborhood ?? 'Centro',
    address: data?.address ?? 'Rua Exemplo',
    number: data?.number ?? '123',
    complement: data?.complement ?? 'Apto 101',
    photoUri: data?.photoUri ?? null,
  };

  const stateLabel = pd.state ? (UF_NAME_MAP[pd.state] || pd.state) : 'Não informado';

  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={Platform.OS === 'android'}
          bounces={Platform.OS === 'ios'}
        >
          {/* Título: Dados pessoais */}
          <Text style={styles.sectionTitle}>Dados pessoais</Text>

          {/* Seção PF / PJ – exibimos conforme o tipo */}
          {pd.personType === 'FISICA' ? (
            <View style={styles.section}>
              <ReadOnlyField label="Nome completo" value={pd.name!} />
              <ReadOnlyField label="CPF" value={pd.cpf!} />
              <ReadOnlyField label="Email" value={pd.email!} />
              <ReadOnlyField label="WhatsApp" value={pd.whatsapp!} />
            </View>
          ) : (
            <View style={styles.section}>
              <ReadOnlyField label="Razão social" value={pd.companyName!} />
              <ReadOnlyField label="CNPJ" value={pd.cnpj!} />
              <ReadOnlyField label="Nome do responsável" value={pd.responsibleName!} />
              <ReadOnlyField label="CPF do responsável" value={pd.responsibleCPF!} />
              <ReadOnlyField label="Email" value={pd.email!} />
              <ReadOnlyField label="WhatsApp" value={pd.whatsapp!} />
            </View>
          )}

          {/* Título: Localização */}
          <Text style={styles.sectionTitle}>Localização</Text>

          {/* Campos de localização */}
          <View style={styles.section}>
            <ReadOnlyField label="Estado" value={stateLabel} />
            <ReadOnlyField label="CEP" value={pd.cep!} />
            <ReadOnlyField label="Cidade" value={pd.city!} />
            <ReadOnlyField label="Bairro" value={pd.neighborhood!} />
            <ReadOnlyField label="Endereço" value={pd.address!} />
            <ReadOnlyField label="Número" value={pd.number!} />
            {pd.complement && <ReadOnlyField label="Complemento" value={pd.complement!} />}
          </View>
          
          {/* Espaçador inferior para garantir margem de respiro */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </View>
  );
};

// Componente utilitário para exibição (usa estilos alinhados ao DS de CreateContact)
const ReadOnlyField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.field}>
    <Text style={styles.label} selectable>{label}</Text>
    <View style={styles.readonlyBox}>
      <Text style={styles.readonlyValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  // Container externo - define o "teto"
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Container interno - define os limites do scroll
  innerContainer: {
    flex: 1,
    position: 'relative',
    // No web, precisa de overflow hidden para o scroll interno funcionar
    ...Platform.select({
      web: {
        overflow: 'hidden',
      } as any,
      default: {},
    }),
  },
  // ScrollView - No web usa position absolute para ter altura definida
  scrollView: {
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
      } as any,
      default: {
        flex: 1,
      },
    }),
  },
  // Conteúdo do scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0, // Removido padding aqui, usando bottomSpacer
  },
  // Título de seção (Dados pessoais, Localização)
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#3A3F51',
    marginBottom: 12,
    marginTop: 8,
  },
  readonlyBox: {
    height: 38,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  readonlyValue: { 
    fontSize: 14, 
    color: '#3A3F51', 
    fontFamily: 'Inter_400Regular' 
  },
  section: { 
    marginTop: 0 
  },
  field: { 
    marginBottom: 14 
  },
  label: { 
    fontSize: 12, 
    color: '#7D8592', 
    fontFamily: 'Inter_500Medium', 
    marginBottom: 6, 
    paddingLeft: 4 
  },
  // Espaçador inferior para margem de respiro (10px)
  bottomSpacer: {
    height: 10,
  },
});

export default SchedulingDetailsPersonalData;