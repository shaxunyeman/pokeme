/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-02 12:22:41
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-13 21:17:06
 * @FilePath: /pokeme/src/service/invitee.ts
 * @Description: handle an invite request
 */

import { Identifer } from '@/model/identifer';
import { PokeRequest, PokeCommand, InviteeBody } from '@/model/protocols';
import { ISigner, IVerifier } from '@/service/signer';
import { IJwtSigner, IJwtVerifier } from '@/service/jwt';
import { sha256 } from '@/unit/crypto';

export class Invitee {
    private signer : ISigner;
    private jwtSigner: IJwtSigner;

    /**
     * @description: 
     * @param {ISigner} signer
     * @param {IJwtSigner} jwtSigner
     * @param {IVerifier} verifier
     * @return {*}
     */
    constructor(signer: ISigner,jwtSigner: IJwtSigner) {
        this.signer = signer;
        this.jwtSigner = jwtSigner;
    }

    /**
     * @description: 
     * @param {Identifer} id
     * @param {string} description
     * @return {*}
     */       
    public allow(id: Identifer, description: string | undefined): {request: PokeRequest, hash: string} {
        const date = new Date();
        const body: InviteeBody = {
            id: id.id,
            allow: true,
            mail: id.mail,
            publicKey: id.publicKey,
            dateTime: date.toUTCString(),
            description: description == undefined ? undefined : description
        };
        const token = this.jwtSigner.sign(body);
        const signature = this.signer.sign(token);
        const reqeust: PokeRequest = {
            command: PokeCommand.INVITEE,
            body: token,
            publicKey: id.publicKey,
            signature: signature
        };

        return {
            request: reqeust,
            hash: sha256(signature)
        };
    }
    
    /**
     * @description: refuse an invite request
     * @param {Identifer} id
     * @param {string} description
     * @return :{response:string, signature: string}
     */
    public refuse(id: Identifer, description: string | undefined): {request: PokeRequest, hash: string} {
        const date = new Date();
        const body: InviteeBody = {
            id: id.id,
            allow: false,
            dateTime: date.toUTCString(),
            description: description == undefined ? undefined : description
        };
        const token = this.jwtSigner.sign(body);
        const signature = this.signer.sign(token);
        const reqeust: PokeRequest = {
            command: PokeCommand.INVITEE,
            body: token,
            publicKey: id.publicKey,
            signature: signature
        };

        return {
            request: reqeust,
            hash: sha256(signature)
        };
    }
}