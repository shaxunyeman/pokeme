/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-13 15:03:29
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-03 14:45:53
 * @FilePath: /pokeme/src/service/messages.ts
 * @Description: 
 */

import { v4 as uuidv4 } from 'uuid';
import { 
    PokeRequest, 
    MessageBody,
    ChatMessage, 
    PokeMessageType, 
    PokeCommand 
} from "@/model/protocols";
import { Random } from "@/unit/random";
import { Symmetric, sha256 } from '@/unit/crypto';
import { ISigner } from "@/service/signer";
import { IJwtSigner } from "@/service/jwt"
import { Account } from "@/model/account";
import { RASAsymmetric } from "@/service/impl/rsaSigner"
import { Identifer } from "@/model/identifer";

export class Messages {
    private signer : ISigner;
    private jwt: IJwtSigner;

    constructor(signer: ISigner, jwt: IJwtSigner) {
        this.signer = signer;
        this.jwt = jwt;
    }

    public singleMessageBody(to: Account, msgId: string, message: string): {body: MessageBody, hash:string} {
        const asymmetric: RASAsymmetric = new RASAsymmetric();
        const date = new Date();
        const passphrase = Random.passphrase(12);
        const body: MessageBody = {
            id: msgId,
            message: Symmetric.cipher(passphrase, message),
            passphrase: asymmetric.cipher(to.publicKey, passphrase),
            dateTime: date.toUTCString()
        }; 
        return {
            body: body,
            hash: sha256(JSON.stringify(body))
        };
    }

    public assembleSingleChat(from: Account,chatMsg: ChatMessage): {request: PokeRequest, hash: string} {
        const token = this.jwt.sign(chatMsg);
        const signature = this.signer.sign(token);
        const hash = sha256(signature);

        const request: PokeRequest = {
            id: uuidv4(),
            command: PokeCommand.MESSAGE,
            body: token,
            publicKey: from.publicKey,
            signature: signature,
        }

        return {
            request: request,
            hash: hash
        }; 
    }

    private chatMessage(from: Account, to: Account ,body: MessageBody): ChatMessage {
        return {
            type: PokeMessageType.SINGLE_CHAT,
            from: from.id,
            to: to.id,
            body: [body]
        }
    }

    public singleChat(from: Identifer, to: Account, msgId: string, message: string): {request: PokeRequest, hash: string} {
        const result = this.singleMessageBody(to, msgId, message);
        const chatMsg: ChatMessage = this.chatMessage(from, to, result.body);
        return this.assembleSingleChat(from, chatMsg);
    }
}
