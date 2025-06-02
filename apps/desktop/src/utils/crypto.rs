/*!
 * HUMaiN2.7 - Cryptography Utilities
 * 
 * Secure cryptographic functions for data protection and authentication
 */

use crate::utils::{HumainError, Result};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, KeyInit, OsRng};
use sha2::{Sha256, Digest};
use ed25519_dalek::{Keypair, PublicKey, SecretKey, Signature, Signer, Verifier};
use rand::RngCore;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;

/// Encrypted data container
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedData {
    pub ciphertext: Vec<u8>,
    pub nonce: Vec<u8>,
    pub algorithm: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Cryptographic key material
#[derive(Debug, Clone)]
pub struct CryptoKey {
    pub key_data: Vec<u8>,
    pub key_type: KeyType,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KeyType {
    Aes256,
    Ed25519Secret,
    Ed25519Public,
    Hmac,
}

/// Digital signature container
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DigitalSignature {
    pub signature: Vec<u8>,
    pub public_key: Vec<u8>,
    pub algorithm: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Generate a cryptographically secure random key
pub fn generate_key(key_type: KeyType) -> Result<CryptoKey> {
    let key_data = match key_type {
        KeyType::Aes256 => {
            let mut key = vec![0u8; 32]; // 256 bits
            OsRng.fill_bytes(&mut key);
            key
        },
        KeyType::Ed25519Secret => {
            let mut seed = vec![0u8; 32];
            OsRng.fill_bytes(&mut seed);
            seed
        },
        KeyType::Hmac => {
            let mut key = vec![0u8; 64]; // 512 bits for HMAC
            OsRng.fill_bytes(&mut key);
            key
        },
        KeyType::Ed25519Public => {
            return Err(HumainError::cryptography("Cannot generate public key directly"));
        },
    };
    
    Ok(CryptoKey {
        key_data,
        key_type,
        created_at: chrono::Utc::now(),
    })
}

/// Encrypt data using AES-256-GCM
pub fn encrypt_data(data: &[u8], key: &CryptoKey) -> Result<EncryptedData> {
    if !matches!(key.key_type, KeyType::Aes256) {
        return Err(HumainError::cryptography("Invalid key type for encryption"));
    }
    
    if key.key_data.len() != 32 {
        return Err(HumainError::cryptography("Invalid key length for AES-256"));
    }
    
    let cipher_key = Key::<Aes256Gcm>::from_slice(&key.key_data);
    let cipher = Aes256Gcm::new(cipher_key);
    
    // Generate random nonce
    let mut nonce_bytes = vec![0u8; 12]; // 96 bits for AES-GCM
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    let ciphertext = cipher.encrypt(nonce, data)
        .map_err(|e| HumainError::cryptography(format!("Encryption failed: {}", e)))?;
    
    Ok(EncryptedData {
        ciphertext,
        nonce: nonce_bytes,
        algorithm: "AES-256-GCM".to_string(),
        timestamp: chrono::Utc::now(),
    })
}

/// Decrypt data using AES-256-GCM
pub fn decrypt_data(encrypted_data: &EncryptedData, key: &CryptoKey) -> Result<Vec<u8>> {
    if !matches!(key.key_type, KeyType::Aes256) {
        return Err(HumainError::cryptography("Invalid key type for decryption"));
    }
    
    if encrypted_data.algorithm != "AES-256-GCM" {
        return Err(HumainError::cryptography("Unsupported encryption algorithm"));
    }
    
    let cipher_key = Key::<Aes256Gcm>::from_slice(&key.key_data);
    let cipher = Aes256Gcm::new(cipher_key);
    let nonce = Nonce::from_slice(&encrypted_data.nonce);
    
    let plaintext = cipher.decrypt(nonce, encrypted_data.ciphertext.as_ref())
        .map_err(|e| HumainError::cryptography(format!("Decryption failed: {}", e)))?;
    
    Ok(plaintext)
}

/// Hash data using SHA-256
pub fn hash_data(data: &[u8]) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().to_vec()
}

/// Create HMAC for data integrity
pub fn create_hmac(data: &[u8], key: &CryptoKey) -> Result<Vec<u8>> {
    if !matches!(key.key_type, KeyType::Hmac) {
        return Err(HumainError::cryptography("Invalid key type for HMAC"));
    }
    
    use hmac::{Hmac, Mac};
    type HmacSha256 = Hmac<Sha256>;
    
    let mut mac = HmacSha256::new_from_slice(&key.key_data)
        .map_err(|e| HumainError::cryptography(format!("HMAC creation failed: {}", e)))?;
    
    mac.update(data);
    Ok(mac.finalize().into_bytes().to_vec())
}

/// Verify HMAC
pub fn verify_hmac(data: &[u8], expected_hmac: &[u8], key: &CryptoKey) -> Result<bool> {
    let computed_hmac = create_hmac(data, key)?;
    Ok(computed_hmac.as_slice() == expected_hmac)
}

/// Generate Ed25519 keypair for digital signatures
pub fn generate_signing_keypair() -> Result<(CryptoKey, CryptoKey)> {
    let mut rng = OsRng;
    let keypair = Keypair::generate(&mut rng);
    
    let secret_key = CryptoKey {
        key_data: keypair.secret.to_bytes().to_vec(),
        key_type: KeyType::Ed25519Secret,
        created_at: chrono::Utc::now(),
    };
    
    let public_key = CryptoKey {
        key_data: keypair.public.to_bytes().to_vec(),
        key_type: KeyType::Ed25519Public,
        created_at: chrono::Utc::now(),
    };
    
    Ok((secret_key, public_key))
}

/// Sign data using Ed25519
pub fn sign_data(data: &[u8], secret_key: &CryptoKey) -> Result<DigitalSignature> {
    if !matches!(secret_key.key_type, KeyType::Ed25519Secret) {
        return Err(HumainError::cryptography("Invalid key type for signing"));
    }
    
    let secret_bytes: [u8; 32] = secret_key.key_data.as_slice().try_into()
        .map_err(|_| HumainError::cryptography("Invalid secret key length"))?;
    
    let secret = SecretKey::from_bytes(&secret_bytes)
        .map_err(|e| HumainError::cryptography(format!("Invalid secret key: {}", e)))?;
    
    let public = PublicKey::from(&secret);
    let keypair = Keypair { secret, public };
    
    let signature = keypair.sign(data);
    
    Ok(DigitalSignature {
        signature: signature.to_bytes().to_vec(),
        public_key: keypair.public.to_bytes().to_vec(),
        algorithm: "Ed25519".to_string(),
        timestamp: chrono::Utc::now(),
    })
}

/// Verify digital signature
pub fn verify_signature(data: &[u8], signature: &DigitalSignature) -> Result<bool> {
    if signature.algorithm != "Ed25519" {
        return Err(HumainError::cryptography("Unsupported signature algorithm"));
    }
    
    let public_bytes: [u8; 32] = signature.public_key.as_slice().try_into()
        .map_err(|_| HumainError::cryptography("Invalid public key length"))?;
    
    let signature_bytes: [u8; 64] = signature.signature.as_slice().try_into()
        .map_err(|_| HumainError::cryptography("Invalid signature length"))?;
    
    let public_key = PublicKey::from_bytes(&public_bytes)
        .map_err(|e| HumainError::cryptography(format!("Invalid public key: {}", e)))?;
    
    let sig = Signature::from_bytes(&signature_bytes)
        .map_err(|e| HumainError::cryptography(format!("Invalid signature: {}", e)))?;
    
    match public_key.verify(data, &sig) {
        Ok(()) => Ok(true),
        Err(_) => Ok(false),
    }
}

/// Secure key derivation function
pub fn derive_key(password: &str, salt: &[u8], iterations: u32) -> Result<CryptoKey> {
    use pbkdf2::pbkdf2_hmac;
    
    let mut key = vec![0u8; 32]; // 256 bits
    pbkdf2_hmac::<Sha256>(password.as_bytes(), salt, iterations, &mut key);
    
    Ok(CryptoKey {
        key_data: key,
        key_type: KeyType::Aes256,
        created_at: chrono::Utc::now(),
    })
}

/// Secure random salt generation
pub fn generate_salt() -> Vec<u8> {
    let mut salt = vec![0u8; 32];
    OsRng.fill_bytes(&mut salt);
    salt
}

/// Key management for user profiles
#[derive(Debug)]
pub struct KeyManager {
    keys: HashMap<String, CryptoKey>,
}

impl KeyManager {
    pub fn new() -> Self {
        Self {
            keys: HashMap::new(),
        }
    }
    
    pub fn store_key(&mut self, key_id: String, key: CryptoKey) {
        self.keys.insert(key_id, key);
    }
    
    pub fn get_key(&self, key_id: &str) -> Option<&CryptoKey> {
        self.keys.get(key_id)
    }
    
    pub fn remove_key(&mut self, key_id: &str) -> Option<CryptoKey> {
        self.keys.remove(key_id)
    }
    
    pub fn list_keys(&self) -> Vec<&String> {
        self.keys.keys().collect()
    }
}

impl Default for KeyManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Secure memory clearing for sensitive data
impl Drop for CryptoKey {
    fn drop(&mut self) {
        // Securely clear key material
        crate::utils::clear_sensitive_memory(&mut self.key_data);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_key_generation() {
        let key = generate_key(KeyType::Aes256).unwrap();
        assert_eq!(key.key_data.len(), 32);
        assert!(matches!(key.key_type, KeyType::Aes256));
    }

    #[test]
    fn test_encryption_decryption() {
        let key = generate_key(KeyType::Aes256).unwrap();
        let data = b"test data for encryption";
        
        let encrypted = encrypt_data(data, &key).unwrap();
        let decrypted = decrypt_data(&encrypted, &key).unwrap();
        
        assert_eq!(data, decrypted.as_slice());
    }

    #[test]
    fn test_hashing() {
        let data = b"test data";
        let hash1 = hash_data(data);
        let hash2 = hash_data(data);
        
        assert_eq!(hash1, hash2);
        assert_eq!(hash1.len(), 32); // SHA-256 produces 32 bytes
    }

    #[test]
    fn test_signing_verification() {
        let (secret_key, _public_key) = generate_signing_keypair().unwrap();
        let data = b"test data for signing";
        
        let signature = sign_data(data, &secret_key).unwrap();
        let is_valid = verify_signature(data, &signature).unwrap();
        
        assert!(is_valid);
        
        // Test with modified data
        let modified_data = b"modified test data";
        let is_valid_modified = verify_signature(modified_data, &signature).unwrap();
        
        assert!(!is_valid_modified);
    }

    #[test]
    fn test_hmac() {
        let key = generate_key(KeyType::Hmac).unwrap();
        let data = b"test data for HMAC";
        
        let hmac = create_hmac(data, &key).unwrap();
        let is_valid = verify_hmac(data, &hmac, &key).unwrap();
        
        assert!(is_valid);
    }

    #[test]
    fn test_key_derivation() {
        let password = "test password";
        let salt = generate_salt();
        
        let key1 = derive_key(password, &salt, 10000).unwrap();
        let key2 = derive_key(password, &salt, 10000).unwrap();
        
        assert_eq!(key1.key_data, key2.key_data);
    }

    #[test]
    fn test_key_manager() {
        let mut manager = KeyManager::new();
        let key = generate_key(KeyType::Aes256).unwrap();
        
        manager.store_key("test_key".to_string(), key);
        
        assert!(manager.get_key("test_key").is_some());
        assert_eq!(manager.list_keys().len(), 1);
        
        manager.remove_key("test_key");
        assert!(manager.get_key("test_key").is_none());
    }
}