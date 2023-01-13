/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-13 15:03:29
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-13 22:05:00
 * @FilePath: /pokeme/src/service/messages.ts
 * @Description: 
 */

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
import { Account } from "@/service/dac/account";
import { RASAsymmetric } from "@/unit/rsa"
import { Identifer } from "@/model/identifer";

export class Messages {
    private signer : ISigner;
    private jwt: IJwtSigner;

    constructor(signer: ISigner, jwt: IJwtSigner) {
        this.signer = signer;
        this.jwt = jwt;
    }

    public singleChat(from: Identifer, to: Account, msgId: number, message: string): {request: PokeRequest, hash: string} {
        const date = new Date();
        const passphrase = Random.passphrase(12);
        const body: MessageBody = {
            id: msgId,
            message: Symmetric.cipher(passphrase, message),
            passphrase: RASAsymmetric.cipher(to.publicKey, passphrase),
            dateTime: date.toUTCString()
        };

        const chatMsg: ChatMessage = {
            type: PokeMessageType.SINGLE_CHAT,
            from: from.id,
            to: to.id,
            body: [body]
        };

        const token = this.jwt.sign(chatMsg);
        const signature = this.signer.sign(token);
        const hash = sha256(signature);

        const request: PokeRequest = {
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
}
