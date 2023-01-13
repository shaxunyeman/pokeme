/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-07 17:53:44
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-13 21:06:26
 * @FilePath: /pokeme/src/service/requestTool.ts
 * @Description: 
 */

import { PokeRequest } from "@/model/protocols";
import { IJwtVerifier } from "@/service/jwt";
import { IVerifier } from "@/service/signer";
import { sha256 } from '@/unit/crypto';

export class PokeRequestDecoder {
    private jwtVerifier: IJwtVerifier;

    /**
     * @description: 
     * @param {IJwtVerifier} jwtVerifier
     * @return {*}
     */    
    constructor(jwtVerifier: IJwtVerifier) {
        this.jwtVerifier = jwtVerifier;
    }

    /**
     * @description: 
     * @param {Poke} request
     * @return {*}
     */    
    public decode(request: PokeRequest): any {
        return this.jwtVerifier.verify(request.body);
    }   
}

export class PokeRequestValidator {
    private verifier: IVerifier

    constructor(verifier: IVerifier) {
        this.verifier = verifier;
    }

    /**
     * @description: Verify the body of a PokeRequest
     * @param {string} body A body of a PokeRequest
     * @param {string} signature
     * @param {string} hash
     * @return {*}
     */
    public verifyBody(body: string, signature: string, hash: string): boolean {
        if(sha256(signature) != hash) {
            return false;
        }

        if(this.verifier) {
            return this.verifier.verify(body, signature);   
        }

        return false;
    }
}