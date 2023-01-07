/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-02 12:22:41
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-07 18:12:50
 * @FilePath: /pokeme/src/service/invitee.ts
 * @Description: handle an invite request
 */

import { Identifer } from '@/model/identifer';
import { PokeRequest, PokeCommand, InviteeBody } from '@/model/protocols';
import { ISigner, IVerifier } from '@/model/signer';
import { IJwtSigner, IJwtVerifier } from '@/model/jwt';
import { sha256 } from '@/unit/crypto';

export class Invitee {
    private signer : ISigner;
    private jwtSigner: IJwtSigner;
    private verifier: IVerifier;
    private jwtVerifier: IJwtVerifier;

    /**
     * @description: 
     * @param {ISigner} signer
     * @param {IJwtSigner} jwtSigner
     * @param {IVerifier} verifier
     * @param {IJwtVerifier} jwtVerifier
     * @return {*}
     */    
    constructor(signer: ISigner,jwtSigner: IJwtSigner, verifier: IVerifier, jwtVerifier: IJwtVerifier) {
        this.signer = signer;
        this.jwtSigner = jwtSigner;
        this.verifier = verifier;
        this.jwtVerifier = jwtVerifier;
    }

    public verifyInviterBody(body: string, signature: string, hash: string): boolean {
        if(sha256(signature) != hash) {
            return false;
        }
        return this.verifier.verify(body, signature);   
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