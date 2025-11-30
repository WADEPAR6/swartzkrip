/**
 * Implementación del cifrado Vigenere
 * Cifra y descifra datos usando el algoritmo Vigenere
 */

export class VigenereCipher {
  private static instance: VigenereCipher;
  private readonly key: string;

  private constructor() {
    this.key = process.env.NEXT_PUBLIC_CRYPTO_KEY || 'SWARTZKRIP2025';
  }

  public static getInstance(): VigenereCipher {
    if (!VigenereCipher.instance) {
      VigenereCipher.instance = new VigenereCipher();
    }
    return VigenereCipher.instance;
  }

  /**
   * Cifra un texto usando el algoritmo Vigenere
   */
  public encrypt(plainText: string): string {
    if (!plainText) return '';
    
    // Convertir a Base64 primero para manejar caracteres especiales
    const base64Text = Buffer.from(plainText).toString('base64');
    let encrypted = '';
    const keyLength = this.key.length;

    for (let i = 0; i < base64Text.length; i++) {
      const charCode = base64Text.charCodeAt(i);
      const keyChar = this.key.charCodeAt(i % keyLength);
      
      // Aplicar cifrado Vigenere con módulo 256 para todos los caracteres ASCII
      const encryptedChar = String.fromCharCode((charCode + keyChar) % 256);
      encrypted += encryptedChar;
    }

    // Convertir a Base64 para transmisión segura
    return Buffer.from(encrypted, 'binary').toString('base64');
  }

  /**
   * Descifra un texto cifrado con Vigenere
   */
  public decrypt(cipherText: string): string {
    if (!cipherText) return '';

    try {
      // Decodificar de Base64
      const encryptedBinary = Buffer.from(cipherText, 'base64').toString('binary');
      let decrypted = '';
      const keyLength = this.key.length;

      for (let i = 0; i < encryptedBinary.length; i++) {
        const charCode = encryptedBinary.charCodeAt(i);
        const keyChar = this.key.charCodeAt(i % keyLength);
        
        // Aplicar descifrado Vigenere
        let decryptedCharCode = (charCode - keyChar) % 256;
        if (decryptedCharCode < 0) decryptedCharCode += 256;
        
        decrypted += String.fromCharCode(decryptedCharCode);
      }

      // Decodificar de Base64 al texto original
      return Buffer.from(decrypted, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Error al descifrar:', error);
      return '';
    }
  }

  /**
   * Cifra un objeto JSON
   */
  public encryptJSON(data: any): string {
    const jsonString = JSON.stringify(data);
    return this.encrypt(jsonString);
  }

  /**
   * Descifra y parsea un objeto JSON
   */
  public decryptJSON<T>(cipherText: string): T | null {
    try {
      const decrypted = this.decrypt(cipherText);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Error al descifrar JSON:', error);
      return null;
    }
  }
}

// Exportar instancia singleton
export const vigenereCipher = VigenereCipher.getInstance();
