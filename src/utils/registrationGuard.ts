import { RegistrationStorage, RegistrationValidation } from './registrationStorage';

// Retorna true se cadastro está incompleto (exceto campo Complemento)
export async function checkIncompleteRegistration(): Promise<boolean> {
  const data = await RegistrationStorage.getRegistrationData();
  if (!data) return true;
  // Usa a validação existente que ignora Complemento como obrigatório
  const complete = RegistrationValidation.isAllDataComplete(data);
  if (complete) {
    await RegistrationStorage.markRegistrationComplete();
  }
  return !complete;
}