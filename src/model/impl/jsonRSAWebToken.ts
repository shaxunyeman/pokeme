/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-02 19:27:53
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-06 00:19:23
 * @FilePath: /i-free-talk/src/service/impl/jsonRSAWebToken.ts
 * @Description: 
 */
import jwt from 'jsonwebtoken';
import { IJwtSigner, IJwtVerifier, JwtPayload } from '@/model/jwt';

export class JsonRSAWebTokenSigner implements IJwtSigner {
    private privateKey: string

    constructor(privateKey: string) {
        this.privateKey = privateKey;
    }
    
    public sign(payload: string | object): string {
        return jwt.sign(payload, { key: this.privateKey, passphrase: '' }, {algorithm: 'RS256'});
    }
}

export class JsonRSAWebTokenVerifier implements IJwtVerifier {
    private publicKey: string

    constructor(publicKey: string) {
        this.publicKey = publicKey;
    }
    public verify(token: string): JwtPayload | string{
        return jwt.verify(token, this.publicKey, { algorithms: ['RS256'] });
    }
}