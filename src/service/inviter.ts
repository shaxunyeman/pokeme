/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-02 12:12:31
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-03 14:13:14
 * @FilePath: /pokeme/src/service/inviter.ts
 * @Description: invite a person
 */

import {v4 as uuidv4} from 'uuid';
import { Identifer } from '@/model/identifer';
import { PokeRequest, PokeCommand, InviterBody } from '@/model/protocols';
import { ISigner } from '@/service/signer';
import { IJwtSigner } from '@/service/jwt';
import { sha256 } from '@/unit/crypto';

export class Inviter {
    private signer : ISigner;
    private jwt: IJwtSigner

    constructor(signer: ISigner, jwt: IJwtSigner) {
        this.signer = signer;
        this.jwt = jwt
    }

    /**
     * @description: construct a request for inviting a person
     * @param {Identifer} id
     * @param {string} description
     * @return :{request:string, signature: string} 
     */    
    public invite(id: Identifer, description: string | undefined): {request: PokeRequest, hash: string} {
        const date = new Date();
        const body: InviterBody = {
            id: id.id,
            mail: id.mail,
            publicKey: id.publicKey,
            dateTime: date.toUTCString(),
            description: description == undefined ? undefined : description
        };

        const token = this.jwt.sign(body);
        const signature = this.signer.sign(token);
        const hash = sha256(signature);

        const request: PokeRequest = {
            id: uuidv4(),
            command: PokeCommand.INVITER,
            body: token,
            publicKey: id.publicKey,
            signature: signature,
        }

        return {
            request: request,
            hash: hash
        };
    }
}