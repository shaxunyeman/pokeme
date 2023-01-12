/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-02 19:27:53
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-12 13:46:04
 * @FilePath: /pokeme/src/model/impl/jsonRSAWebToken.ts
 * @Description: 
 */
import jwt from 'jsonwebtoken';
import { IJwtSigner, IJwtVerifier } from '@/service/jwt';
import { PokeJwtPayload } from '@/model/jwtPayload'

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
    public verify(token: string): PokeJwtPayload | string{
        return jwt.verify(token, this.publicKey, { algorithms: ['RS256'] });
    }
}