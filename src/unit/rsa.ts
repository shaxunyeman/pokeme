/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-04 23:29:17
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-13 21:57:54
 * @FilePath: /pokeme/src/unit/rsa.ts
 * @Description: 
 */

import * as crypto from "crypto";

export class RASKeyPair {
    public static generate(): any {
        return crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: ''
            }
        });
    }
}

export class RASAsymmetric {
    public static cipher(publicKey: string, message: string): string {
        return crypto.publicEncrypt(publicKey, Buffer.from(message)).toString('hex');
    }

    public static decipher(privateKey: string, encrypted: string): string {
        return crypto.privateDecrypt({key: privateKey, passphrase: ''}, Buffer.from(encrypted, 'hex')).toString();
    }
}