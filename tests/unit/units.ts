/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-07 14:09:04
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-20 00:44:30
 * @FilePath: /pokeme/tests/unit/units.ts
 * @Description: 
 */

import { Identifer } from "@/model/identifer";
import { PokeRequest } from '@/model/protocols';
import { Inviter } from "@/service/inviter";
import { ISigner } from "@/service/signer";
import { IJwtSigner } from '@/service/jwt';
import { Account } from "@/service/dac/account";
import { Messages } from "@/service/messages";
import { Outbound } from "@/service/outBound";
import { IPersistent } from "@/service/dac/persistent"
import { ITransporter } from "@/service/transporter";
import { RASKeyPair,  } from "@/unit/rsa";

export class TestAccount {
    public static generateAccount(name:string): {account: Account, key:{publicKey:string, privateKey: string}} {
        const rasKey = RASKeyPair.generate();
        const account: Account = {
            id: `${name}@pokeme.com`,
            mail: `${name}@pokeme.com`,
            publicKey: rasKey.publicKey,
            name: name
        };

        return {
            account: account,
            key: {
                publicKey: rasKey.publicKey,
                privateKey: rasKey.privateKey
            }
        }
    }

    public static generateId(name: string): {id: Identifer, key:{publicKey:string, privateKey: string}} {
        const rasKey = RASKeyPair.generate();
        const id: Identifer = {
            id: `${name}@pokeme.com`,
            mail: `${name}@pokeme.com`,
            publicKey: rasKey.publicKey,
            name: name
        };

        return {
            id: id,
            key: {
                publicKey: rasKey.publicKey,
                privateKey: rasKey.privateKey
            }
        }
    }
}

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

    public newMessage(to: Account, msgId: number, message: string): {request: PokeRequest, hash: string} {
        const messages: Messages = new Messages(this.signer, this.jwtSigner);
        return messages.singleChat(this.id, to, msgId, message);
    }

    public newOutbound(transporter: ITransporter, persistent: IPersistent): Outbound {
        return new Outbound(this.id, this.signer, this.jwtSigner, transporter, persistent);
    }
}

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));