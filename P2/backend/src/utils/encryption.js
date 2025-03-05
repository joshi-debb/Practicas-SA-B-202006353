const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = process.env.IV_LENGTH;


if (ENCRYPTION_KEY.length !== 32) {
    throw new Error("La clave de cifrado ENCRYPTION_KEY debe tener 32 caracteres exactos.");
}

// Función para cifrar con AES-256-CBC
function encrypt(text) {
    const iv = crypto.randomBytes(parseInt(IV_LENGTH));
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// Función para descifrar con AES-256-CBC
function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Exportar las funciones
module.exports = { 
    encrypt, 
    decrypt 
};
