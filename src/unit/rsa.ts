/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-04 23:29:17
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-07 10:13:14
 * @FilePath: /i-free-talk/src/service/rsa.ts
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