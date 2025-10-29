import { saveLocation, getLocation, clearLocation } from '../src/utils/storage';

describe('Location storage persistence', () => {
  beforeEach(() => {
    clearLocation();
  });

  test('returns null when no location saved', () => {
    expect(getLocation()).toBeNull();
  });

  test('persists and retrieves location data', () => {
    saveLocation('SP', 'São Paulo');
    expect(getLocation()).toEqual({ state: 'SP', city: 'São Paulo' });
  });

  test('updates persisted location between sessions', () => {
    saveLocation('SP', 'São Paulo');
    expect(getLocation()).toEqual({ state: 'SP', city: 'São Paulo' });

    // Simulate user changing during another navigation session
    saveLocation('RJ', 'Rio de Janeiro');
    expect(getLocation()).toEqual({ state: 'RJ', city: 'Rio de Janeiro' });
  });

  test('clears location data correctly', () => {
    saveLocation('MG', 'Belo Horizonte');
    expect(getLocation()).toEqual({ state: 'MG', city: 'Belo Horizonte' });
    clearLocation();
    expect(getLocation()).toBeNull();
  });
});