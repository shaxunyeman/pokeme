/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-07 17:53:44
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-12 13:43:26
 * @FilePath: /pokeme/src/service/decodeRequest.ts
 * @Description: 
 */

import { PokeRequest } from "@/model/protocols";
import { IJwtVerifier } from "@/service/jwt";

export class RequestDecoder {
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