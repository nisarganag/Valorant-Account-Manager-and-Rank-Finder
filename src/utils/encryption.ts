import CryptoJS from "crypto-js";

const FIXED_SECRET_KEY = "MySecretKey12345"; // 16 bytes for AES-128
const FIXED_IV = "MyInitVector1234"; // 16 bytes IV

export class EncryptionService {
  private static fixedKey = CryptoJS.enc.Utf8.parse(FIXED_SECRET_KEY);
  private static fixedIv = CryptoJS.enc.Utf8.parse(FIXED_IV);

  // Simple encryption/decryption with fixed key (for initial implementation)
  static encrypt(text: string): string {
    const encrypted = CryptoJS.AES.encrypt(text, this.fixedKey, {
      iv: this.fixedIv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  }

  static decrypt(encryptedText: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, this.fixedKey, {
      iv: this.fixedIv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  // Password-based encryption (for future enhancement)
  static encryptWithPassword(text: string, password: string): string {
    const key = CryptoJS.PBKDF2(password, FIXED_SECRET_KEY, {
      keySize: 128 / 32,
      iterations: 1000,
    });
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: this.fixedIv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  }

  static decryptWithPassword(encryptedText: string, password: string): string {
    const key = CryptoJS.PBKDF2(password, FIXED_SECRET_KEY, {
      keySize: 128 / 32,
      iterations: 1000,
    });
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: this.fixedIv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  static hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(16).toString();
  }

  static hashPasswordWithSalt(password: string, salt: string): string {
    return CryptoJS.SHA256(password + salt).toString();
  }
}
