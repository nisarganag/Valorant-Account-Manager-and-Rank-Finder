import CryptoJS from "crypto-js";

const FIXED_SECRET_KEY = "MySecretKey12345"; // Legacy key for migration
const FIXED_IV = "MyInitVector1234"; // Legacy IV for migration

export class EncryptionService {
  private static fixedKey = CryptoJS.enc.Utf8.parse(FIXED_SECRET_KEY);
  private static fixedIv = CryptoJS.enc.Utf8.parse(FIXED_IV);
  private static salt: string | null = null;
  private static userKey: CryptoJS.lib.WordArray | null = null;
  private static userPassword: string | null = null;

  static setPassword(password: string): void {
    this.userPassword = password;
    this.salt = this.salt || CryptoJS.lib.WordArray.random(16).toString();
    this.deriveKey();
  }

  static getSalt(): string | null {
    return this.salt;
  }

  static setSalt(salt: string): void {
    this.salt = salt;
    if (this.userPassword) {
      this.deriveKey();
    }
  }

  private static deriveKey(): void {
    if (!this.userPassword || !this.salt) return;
    this.userKey = CryptoJS.PBKDF2(this.userPassword, this.salt, {
      keySize: 128 / 32,
      iterations: 100000,
    });
  }

  static hasPassword(): boolean {
    return this.userKey !== null;
  }

  // Encrypt with user's master password key
  static encrypt(text: string): string {
    const key = this.userKey || this.fixedKey;
    const iv = this.userKey
      ? CryptoJS.lib.WordArray.random(16)
      : this.fixedIv;

    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    if (this.userKey) {
      // Prepend IV for password-based encryption
      return iv.toString() + ":" + encrypted.toString();
    }
    return encrypted.toString();
  }

  // Decrypt with user's master password key, with legacy fallback
  static decrypt(encryptedText: string): string {
    // Try password-based decryption if we have a key and data looks like new format
    if (this.userKey && encryptedText.includes(':')) {
      const parts = encryptedText.split(':');
      if (parts.length >= 2) {
        try {
          const iv = CryptoJS.enc.Hex.parse(parts[0]);
          const ciphertext = parts.slice(1).join(':');
          const decrypted = CryptoJS.AES.decrypt(ciphertext, this.userKey, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          });
          const result = decrypted.toString(CryptoJS.enc.Utf8);
          if (result) return result;
        } catch {
          // Fall through to legacy
        }
      }
    }

    // Fallback to legacy fixed-key decryption
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, this.fixedKey, {
        iv: this.fixedIv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      if (result) return result;
    } catch {
      // Will throw below
    }

    throw new Error('Failed to decrypt data. The file may be corrupted or the password is incorrect.');
  }

  // Legacy decrypt for migration
  static decryptLegacy(encryptedText: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, this.fixedKey, {
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
}
