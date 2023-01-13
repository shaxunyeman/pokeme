/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-07 10:46:41
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-13 22:05:13
 * @FilePath: /pokeme/src/unit/crypto.ts
 * @Description: 
 */

import * as crypto from "crypto";

export function sha256(chunk: any):string {
    const hmac = crypto.createHash('sha256');
    hmac.write(chunk);
    hmac.end();
    return hmac.read().toString('hex');
}

export class Symmetric {
    public static cipher(password: string, message: string): string {
        const key = crypto.scryptSync(password, 'salt', 24);
        const iv = Buffer.alloc(16, 0);
        const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
        cipher.setEncoding('hex');
        cipher.write(message);
        cipher.end();
        return cipher.read();
    }

    public static decipher(password: string, encrypted: string): string {
        const key = crypto.scryptSync(password, 'salt', 24);
        const iv = Buffer.alloc(16, 0);
        const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
        decipher.setEncoding('utf-8');
        decipher.write(encrypted, 'hex');
        decipher.end();
        return decipher.read();
    }
}