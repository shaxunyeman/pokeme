/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-07 14:09:04
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-31 16:50:11
 * @FilePath: /pokeme/tests/unit/units.ts
 * @Description: 
 */

import { Identifer } from "@/model/identifer";
import { PokeRequest } from '@/model/protocols';
import { Inviter } from "@/service/inviter";
import { ISigner } from "@/service/signer";
import { IJwtSigner, IJwtVerifier } from '@/service/jwt';
import { IReceiver } from "@/service/receiver";
import { Account } from "@/model/account";
import { Messages } from "@/service/messages";
import { Outbound } from "@/service/outBound";
import { Inbound } from "@/service/inBound";
import { IPersistent } from "@/service/dac/persistent"
import { ITransporter } from "@/service/transporter";
import { ISensitivity } from "@/service/sensitivity";
import { RASKeyPair,  } from "@/unit/rsa";
import { Invitee } from "@/service/invitee";

export class TestAccount {
    public static generateAccount(name:string, domain?: string): {account: Account, key:{publicKey:string, privateKey: string}} {
        const rasKey = RASKeyPair.generate();
        if(domain === undefined) {
            domain = 'pokeme.com';
        }
        const account: Account = {
            id: `${name}@${domain}`,
            mail: `${name}@${domain}`,
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

    public static generateId(name: string, domain?: string): {id: Identifer, key:{publicKey:string, privateKey: string}} {
        const rasKey = RASKeyPair.generate();
        if(domain === undefined) {
            domain = 'pokeme.com';
        }
        const id: Identifer = {
            id: `${name}@${domain}`,
            mail: `${name}@${domain}`,
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

    public newInviteeRequest(to: Account, allow: boolean): {request: PokeRequest, hash: string} {
        const invitee: Invitee = new Invitee(this.signer, this.jwtSigner);
        if(allow) {
            return invitee.allow(to, 'allow invite');
        } else {
            return invitee.refuse(to, 'refuse invite')
        }
    }

    public newMessage(to: Account, msgId: number, message: string): {request: PokeRequest, hash: string} {
        const messages: Messages = new Messages(this.signer, this.jwtSigner);
        return messages.singleChat(this.id, to, msgId, message);
    }

    public newOutbound(transporter: ITransporter, persistent: IPersistent): Outbound {
        return new Outbound(this.id, this.signer, this.jwtSigner, transporter, persistent);
    }

    public newInbound(jwtVerifier: IJwtVerifier, receiver: IReceiver, persistent: IPersistent): Inbound {
        return new Inbound(jwtVerifier, receiver, persistent);
    }
}

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));


export class TestSensitivity implements ISensitivity {
    public password(who: Account): string {
        return process.env.POKEMEIMAPAUTHCODE as string;
    }
}