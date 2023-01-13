/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-02 18:12:18
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-13 22:19:30
 * @FilePath: /pokeme/src/service/signer.ts
 * @Description: 
 */

export interface ISigner {
    sign(payload: string | object): string
}

export interface IVerifier {
    verify(token: string, signature: string): boolean
}

export interface IAsymmetric {
    cipher(publicKey: string, message: string): string
    decipher(privateKey: string, encrypted: string): string
}