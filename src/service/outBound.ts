/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-13 12:58:19
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-13 17:35:19
 * @FilePath: /pokeme/src/service/outBound.ts
 * @Description: 
 */

import { ISigner } from "@/service/signer";
import { IJwtSigner } from "@/service/jwt";
import { Inviter } from "@/service/inviter";
import { Invitee } from "@/service/invitee";
import { Messages } from "@/service/messages";
import { IAccount } from "@/service/dac/account";
import { Identifer } from "@/model/identifer";
import { PokeErrorCode } from "@/model/errorCodes"


export class Outbound {
    private id: Identifer;
    private signer: ISigner;
    private jwtSigner: IJwtSigner;
    private accountAccess: IAccount;

    constructor(id: Identifer, signer: ISigner, jwtSigner: IJwtSigner, accountAccess: IAccount) {
        this.id = id;
        this.signer = signer
        this.jwtSigner = jwtSigner
        this.accountAccess = accountAccess;
    }

    /**
     * @description: send a chat/group message to a person
     * @param {string} to
     * @param {string} message
     * @return {*} return a `PokeErrorCode`
     */
    public sendChatMessage(to: string, message: string): { code: PokeErrorCode, hash: string } {
        const toAccount = this.accountAccess.getAccount(to);
        if (toAccount === undefined) {
            return {
                code: PokeErrorCode.ACCOUNT_NOT_EXIST,
                hash: ''
            };
        }

        const chatMessage: Messages = new Messages(this.signer, this.jwtSigner);
        const result = chatMessage.singleChat(this.id, toAccount, toAccount.msgId, message);
        return {
            code: PokeErrorCode.SUCCESS,
            hash: result.hash
        };
    }

    /**
     * @description: send a request for inviting a person
     * @param {string} to
     * @param {string} description
     * @return {*} if successful returns a hash of the request, otherwise returns `undefined`
     */    
    public sendInvite(to: string, description: string | undefined): string | undefined {
        const inviter: Inviter = new Inviter(this.signer, this.jwtSigner);
        const result = inviter.invite(this.id, description);
        return result.hash;
    }

    /**
     * @description: send a response for an inviter request
     * @param {string} to
     * @param {boolean} allow
     * @param {string} description
     * @return {*}
     */    
    public sendInvitee(to: string, allow: boolean, description?: string): string | undefined {
        const invitee: Invitee = new Invitee(this.signer, this.jwtSigner);
        var result: any;
        if(allow) {
            result = invitee.allow(this.id, description);
        } else {
            result = invitee.refuse(this.id, description);
        }
        return result.hash;
    }
}
