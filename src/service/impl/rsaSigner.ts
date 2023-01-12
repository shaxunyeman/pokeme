/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-04 23:23:37
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-12 13:42:14
 * @FilePath: /pokeme/src/model/impl/rsaSigner.ts
 * @Description: 
 */

import { ISigner, IVerifier } from "@/service/signer";
import * as crypto from "crypto";

// refer to: https://blog.logrocket.com/node-js-crypto-module-a-tutorial/

export class RSASigner implements ISigner {
    private privateKey: string;   

    constructor(privateKey: string) {
        this.privateKey = privateKey;
    }

    public sign(payload: string | object): string {
        const signature = crypto.createSign('SHA256');
        signature.write(payload);
        signature.end();
        return signature.sign({ key: this.privateKey, passphrase: '' }, 'hex');
    }
}

export class RSAVerifier implements IVerifier {
    private publicKey: string;   

    constructor(publicKey: string) {
        this.publicKey = publicKey;
    }

    public verify(token: string, signature: string): boolean {
        const verifier = crypto.createVerify('SHA256');
        verifier.write(token);
        verifier.end();
        return verifier.verify(this.publicKey, signature, 'hex');
    }
}