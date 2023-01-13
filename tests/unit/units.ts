/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-07 14:09:04
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-13 18:09:59
 * @FilePath: /pokeme/tests/unit/units.ts
 * @Description: 
 */

import { Identifer } from "@/model/identifer";
import { Inviter } from "@/service/inviter";
import { ISigner } from "@/service/signer";
import { IJwtSigner } from '@/service/jwt';
import { PokeRequest } from '@/model/protocols';
import { Account } from "@/service/dac/account";
import { Messages } from "@/service/messages"

export class Factory {
    private id: Identifer;
    private signer: ISigner;
    private jwtSigner: IJwtSigner;

    constructor(id: Identifer, signer: ISigner, jwtSigner: IJwtSigner) {
        this.id = id;
        this.signer = signer;
        this.jwtSigner = jwtSigner;
    }

    public newInviteRequest(): {request: PokeRequest, hash: string} {
        const inviter: Inviter = new Inviter(this.signer, this.jwtSigner);
        return inviter.invite(this.id, "an example request"); 
    }

    public newMessage(to: Account, message: string): {request: PokeRequest, hash: string} {
        const messages: Messages = new Messages(this.signer, this.jwtSigner);
        return messages.singleChat(this.id, to, to.msgId, message);
    }
}