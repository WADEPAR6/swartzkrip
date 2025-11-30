import { vigenereCipher } from '../crypto/vigenere';

/**
 * Interface para definir el contrato de cifrado
 * Permite cambiar fácilmente entre diferentes algoritmos
 */
export interface IEncryption {
  encrypt(plainText: string): string;
  decrypt(cipherText: string): string;
  encryptJSON(data: any): string;
  decryptJSON<T>(cipherText: string): T | null;
}

/**
 * Hook/Utilidad de cifrado
 * Capa de abstracción que permite cambiar el algoritmo de cifrado sin afectar el resto del código
 */
class EncryptionService implements IEncryption {
  private static instance: EncryptionService;
  private encryptionEngine: IEncryption;

  private constructor() {
    // Aquí puedes cambiar fácilmente el motor de cifrado
    // Por ahora usa Vigenere, pero podrías usar AES, RSA, etc.
    this.encryptionEngine = vigenereCipher;
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Cifra un texto plano
   */
  public encrypt(plainText: string): string {
    return this.encryptionEngine.encrypt(plainText);
  }

  /**
   * Descifra un texto cifrado
   */
  public decrypt(cipherText: string): string {
    return this.encryptionEngine.decrypt(cipherText);
  }

  /**
   * Cifra un objeto JSON
   */
  public encryptJSON(data: any): string {
    return this.encryptionEngine.encryptJSON(data);
  }

  /**
   * Descifra y parsea un objeto JSON
   */
  public decryptJSON<T>(cipherText: string): T | null {
    return this.encryptionEngine.decryptJSON<T>(cipherText);
  }

  /**
   * Cambia el motor de cifrado en tiempo de ejecución (opcional)
   */
  public setEncryptionEngine(engine: IEncryption): void {
    this.encryptionEngine = engine;
  }
}

// Exportar instancia singleton
export const useEncryption = EncryptionService.getInstance();
export default useEncryption;