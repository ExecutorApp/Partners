import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRegistrationValidation } from '../../hooks/useRegistrationValidation';

const RegistrationExample: React.FC = () => {
  const { registrationData, updateRegistrationData } = useRegistrationValidation();
  
  const [personalData, setPersonalData] = useState({
    name: registrationData.personal?.name || '',
    cpf: registrationData.personal?.cpf || '',
    email: registrationData.personal?.email || '',
    phone: registrationData.personal?.phone || '',
    birthDate: registrationData.personal?.birthDate || '',
  });

  const [companyData, setCompanyData] = useState({
    companyName: registrationData.company?.companyName || '',
    cnpj: registrationData.company?.cnpj || '',
    address: registrationData.company?.address || '',
    city: registrationData.company?.city || '',
    state: registrationData.company?.state || '',
  });

  const [bankingData, setBankingData] = useState({
    bank: registrationData.banking?.bank || '',
    agency: registrationData.banking?.agency || '',
    account: registrationData.banking?.account || '',
    accountType: registrationData.banking?.accountType || '',
    pixKey: registrationData.banking?.pixKey || '',
  });

  // Salvar dados em tempo real (onChange)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateRegistrationData('personal', personalData);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [personalData, updateRegistrationData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateRegistrationData('company', companyData);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [companyData, updateRegistrationData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateRegistrationData('banking', bankingData);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [bankingData, updateRegistrationData]);

  const handleInputChange = (category: string, field: string, value: string) => {
    switch (category) {
      case 'personal':
        setPersonalData(prev => ({ ...prev, [field]: value }));
        break;
      case 'company':
        setCompanyData(prev => ({ ...prev, [field]: value }));
        break;
      case 'banking':
        setBankingData(prev => ({ ...prev, [field]: value }));
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados Pessoais</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nome Completo"
          value={personalData.name}
          onChangeText={(text) => handleInputChange('personal', 'name', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="CPF"
          value={personalData.cpf}
          onChangeText={(text) => handleInputChange('personal', 'cpf', text)}
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={personalData.email}
          onChangeText={(text) => handleInputChange('personal', 'email', text)}
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          value={personalData.phone}
          onChangeText={(text) => handleInputChange('personal', 'phone', text)}
          keyboardType="phone-pad"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Data de Nascimento"
          value={personalData.birthDate}
          onChangeText={(text) => handleInputChange('personal', 'birthDate', text)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados da Empresa</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nome da Empresa"
          value={companyData.companyName}
          onChangeText={(text) => handleInputChange('company', 'companyName', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="CNPJ"
          value={companyData.cnpj}
          onChangeText={(text) => handleInputChange('company', 'cnpj', text)}
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Endereço"
          value={companyData.address}
          onChangeText={(text) => handleInputChange('company', 'address', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Cidade"
          value={companyData.city}
          onChangeText={(text) => handleInputChange('company', 'city', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Estado"
          value={companyData.state}
          onChangeText={(text) => handleInputChange('company', 'state', text)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados Bancários</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Banco"
          value={bankingData.bank}
          onChangeText={(text) => handleInputChange('banking', 'bank', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Agência"
          value={bankingData.agency}
          onChangeText={(text) => handleInputChange('banking', 'agency', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Conta"
          value={bankingData.account}
          onChangeText={(text) => handleInputChange('banking', 'account', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Tipo de Conta"
          value={bankingData.accountType}
          onChangeText={(text) => handleInputChange('banking', 'accountType', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Chave PIX"
          value={bankingData.pixKey}
          onChangeText={(text) => handleInputChange('banking', 'pixKey', text)}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1777CF',
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});

export default RegistrationExample;