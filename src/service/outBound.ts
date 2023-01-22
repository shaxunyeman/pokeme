/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-13 12:58:19
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-21 14:01:29
 * @FilePath: /pokeme/src/service/outBound.ts
 * @Description: 
 */

import { ISigner } from "@/service/signer";
import { IJwtSigner } from "@/service/jwt";
import { Inviter } from "@/service/inviter";
import { Invitee } from "@/service/invitee";
import { Messages } from "@/service/messages";
import { IPersistent } from "@/service/dac/persistent";
import { ITransporter } from "@/service/transporter";
import { Identifer } from "@/model/identifer";
import { PokeErrorCode } from "@/model/errorCodes";
import { MessageBody, ChatMessage, PokeRequest, PokeMessageType } from "@/model/protocols";
import { Account } from "@/service/dac/account";

export class Outbound {
    private id: Identifer;
    private signer: ISigner;
    private jwtSigner: IJwtSigner;
    private transporter: ITransporter;
    private persistent: IPersistent;
    private stopped: boolean;
    private timerId!: NodeJS.Timer;

    constructor(
        id: Identifer,
        signer: ISigner,
        jwtSigner: IJwtSigner,
        transporter: ITransporter,
        persistent: IPersistent) {

        this.id = id;
        this.signer = signer
        this.jwtSigner = jwtSigner
        this.persistent = persistent;
        this.transporter = transporter;
        this.stopped = false;
    }

    /**
     * @description: start a timer for sending requests in interval
     * @return {*}
     */    
    public start(): void {
        this.timerId = setInterval(() => {
            if(this.stopped) {
                clearInterval(this.timerId);
                return;
            }
            this.transportRequest();
        }, 1000);
    }

    /**
     * @description: stop a started timer
     * @return {*}
     */    
    public stop(): void {
        this.stopped = true;
    }

    /**
     * @description: send a chat/group message to a person
     * @param {string} to
     * @param {string} message
     * @return {*} return a `PokeErrorCode`
     */
    public sendChatMessage(to: Account, msgId:number, message: string): { code: PokeErrorCode, hash: string } {
        if(this.stopped) {
            return {
                code: PokeErrorCode.SYSTEM_STOPPED,
                hash: ''
            };
        }

        const toAccount = this.persistent.getAccount().get(to.id);
        if (toAccount === undefined) {
            return {
                code: PokeErrorCode.ACCOUNT_NOT_EXIST,
                hash: ''
            };
        }

        const chatMessage: Messages = new Messages(this.signer, this.jwtSigner);
        let result: any;
        result = chatMessage.singleMessageBody(toAccount, msgId, message);
        if(this.persistentRequest(to, result.body) !== PokeErrorCode.SUCCESS) {
            console.warn("append a chat message was unsuccessful. from: %s, to: %s, hash: %s", this.id.id, to.id, result.hash);
            console.warn("sending a chat message directorly.");
            result = chatMessage.singleChat(this.id, toAccount, msgId, message);
            this.transporter.send(to, result.request);
        }

        return {
            code: PokeErrorCode.SUCCESS,
            hash: result.hash
        };
    }

    public sendFile(to: string, filePath: string): { code: PokeErrorCode, hash: string } {
        if(this.stopped) {
            return {
                code: PokeErrorCode.SYSTEM_STOPPED,
                hash: ''
            };
        }

        return {
            code: PokeErrorCode.NONE,
            hash: ''
        }
    }

    /**
     * @description: send a request for inviting a person
     * @param {string} to
     * @param {string} description
     * @return {*} if successful returns a hash of the request, otherwise returns `undefined`
     */    
    public sendInvite(to: Account, description: string | undefined): { code: PokeErrorCode, hash: string } {

        if(this.stopped) {
            return {
                code: PokeErrorCode.SYSTEM_STOPPED,
                hash: ''
            };
        }

        const inviter: Inviter = new Inviter(this.signer, this.jwtSigner);
        const result = inviter.invite(this.id, description);

        if(this.persistentRequest(to, result.request) !== PokeErrorCode.SUCCESS) {
            console.warn("append an invite was unsuccessful. from: %s, to: %s, hash: %s", this.id.id, to.id, result.hash);
            console.warn("sending an invite directorly.");
            this.transporter.send(to, result.request);
        }

        return {
            code: PokeErrorCode.SUCCESS,
            hash: result.hash
        };
    }

    /**
     * @description: send a response for an inviter request
     * @param {string} to
     * @param {boolean} allow
     * @param {string} description
     * @return {*}
     */    
    public sendInvitee(to: Account, allow: boolean, description?: string): { code: PokeErrorCode, hash: string } {
        if(this.stopped) {
            return {
                code: PokeErrorCode.SYSTEM_STOPPED,
                hash: ''
            };
        }

        const invitee: Invitee = new Invitee(this.signer, this.jwtSigner);
        var result: any;
        if(allow) {
            result = invitee.allow(this.id, description);
        } else {
            result = invitee.refuse(this.id, description);
        }

        if(this.persistentRequest(to, result.request) !== PokeErrorCode.SUCCESS) {
            console.warn("append an invitee was unsuccessful. from: %s, to: %s, hash: %s", this.id.id, to.id, result.hash);
            console.warn("sending an invitee directorly.");
            this.transporter.send(to, result.request);
        }

        return {
            code: PokeErrorCode.SUCCESS,
            hash: result.hash
        };
    }

    private persistentRequest(to: Account, request: PokeRequest | MessageBody): PokeErrorCode {
        const sending =  this.persistent.getSendingQueuen();
        return sending.append(to, request);
    }

    private transportRequest() {
        const accountTable = this.persistent.getAccount();
        const sending = this.persistent.getSendingQueuen();
        const accounts = accountTable.getAll();
        accounts.forEach((account: Account, _index: number) => {
            const msgs = sending.retrive(account);
            if(msgs.length > 0) {
                this.transportMessages(account, msgs);
            }
        });
    }

    private transportMessages(to: Account, msgs: any[]) {
        let messageBodys: MessageBody[] = new Array();

        msgs.forEach((msg,_index) => {
            if((msg as MessageBody)['message'] !== undefined) {
                // chatMessage should assemble body
                messageBodys.push(msg)
            } else if ((msg as PokeRequest)['command'] !== undefined) {
                // invite and invitee request can send directly
                this.transporter.send(to, msg);
            }
        })

        if(messageBodys.length === 0) {
            return;
        }

        let chatMessage: ChatMessage = {
            type: PokeMessageType.SINGLE_CHAT,
            from: this.id.id,
            to: to.id,
            body: []
        };

        messageBodys.forEach((msg: MessageBody, _index: number) => {
            chatMessage.body.push(msg);
        })

        const messages: Messages = new Messages(this.signer, this.jwtSigner);
        const result = messages.assembleSingleChat(this.id, chatMessage);
        this.transporter.send(to, result.request);
    }
}
