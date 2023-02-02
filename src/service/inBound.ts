/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-21 12:41:10
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-02 15:07:48
 * @FilePath: /pokeme/src/service/inBound.ts
 * @Description: 
 */

import PubSub from 'pubsub-js';
import { IReceiver } from '@/service/receiver';
import { IPersistent } from "@/service/dac/persistent";
import { Account } from "@/model/account";
import { IJwtVerifier } from '@/service/jwt';
import { PokeRequest, InviterBody, InviteeBody, ChatMessage, PokeMessageType } from '@/model/protocols';
import { PokeRequestDecoder } from "@/service/requestTool";

type SubscriptionListener<T> = (message: string, data?: T) => void;

export enum InboundEventType {
    INVITER = 'inviter',
    INVITEE = 'invitee',
    SINGLE_MESSAGE = 'single_message',
    GROUP_MESSAGE = 'group_message'
}

export class Inbound {

    private jwtVerifier: IJwtVerifier;
    private receiver: IReceiver;
    private persistent: IPersistent; 
    private stopped: boolean;
    private timerId!: NodeJS.Timer;

    constructor(jwtVerifier: IJwtVerifier, receiver: IReceiver, persistent: IPersistent) {
        this.jwtVerifier = jwtVerifier;
        this.receiver = receiver;
        this.persistent = persistent;
        this.stopped = false;
    }

    /**
     * @description: start a timer for receiving requests in interval
     * @return {*}
     */    
    public start(): void {
        this.timerId = setInterval(() => {
            if(this.stopped) {
                clearInterval(this.timerId);
                PubSub.clearAllSubscriptions();
                return;
            }
            this.receiveRoutine();
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
     * @description: listen an event
     * @param {InboundEventType} event
     * @param {SubscriptionListener} func
     * @return {*} 
     */    
    public subscribe(event: InboundEventType, func: SubscriptionListener<any>): string {
        return PubSub.subscribe(event, func);
    }

    /**
     * @description: stop to listen an event
     * @param {string} token
     * @return {*}
     */    
    public unsubscribe(token: string): boolean {
        return PubSub.unsubscribe(token) as boolean;
    }

    private receiveRoutine() {
        const accountTable = this.persistent.getIAccount();
        const accounts = accountTable.getAll();
        accounts.forEach((account: Account, _index: number) => {
            const msgs = this.receiver.receive(account);
            if(msgs.length > 0) {
                this.dispatchRequest(account, msgs);
            }
        });
    }

    private dispatchRequest(who: Account, msgs: any[]) {
        msgs.forEach((msg: any, _index: number) => {
            if ((msg as PokeRequest)['command'] === undefined || (msg as PokeRequest)['body'] === undefined) {
                console.error('msg is not PokeRequest Object: %s', msg);
            } else {
                this.dispatchEvent(who, msg as PokeRequest);
            }
        })
    }

    private dispatchEvent(who: Account, request: PokeRequest) {
        try {
            const decoder: PokeRequestDecoder = new PokeRequestDecoder(this.jwtVerifier);
            const requestBody = decoder.decode(request);
            if (this.isInviteeBody(requestBody)) {
                PubSub.publish(InboundEventType.INVITEE, {
                    from: who,
                    invitee: requestBody as InviteeBody
                });
            } else if (this.isInviterBody(requestBody)) {
                PubSub.publish(InboundEventType.INVITER, {
                    from: who,
                    inviter: requestBody as InviterBody
                });
            } else if (this.isChatMessageBody(requestBody)) {
                const chatMessage: ChatMessage = requestBody as ChatMessage;
                let event = InboundEventType.SINGLE_MESSAGE;
                if (chatMessage.type === PokeMessageType.SINGLE_CHAT) {
                    event = InboundEventType.SINGLE_MESSAGE;
                } else if (chatMessage.type === PokeMessageType.GROUP_CHAT) {
                    event = InboundEventType.GROUP_MESSAGE;
                }
                PubSub.publish(event, {
                    from: who,
                    chatMessage: chatMessage
                })
            } else {
                console.warn("not support message: ", request);
            }
        } catch(err: any) {
            console.error('raise an error in dispatch: %s', err);
        } finally {

        }
    }

    private isInviterBody(body: any): boolean {
        return (body as InviterBody)['id'] !== undefined
            && (body as InviterBody)['mail'] !== undefined
            && (body as InviterBody)['dateTime'] !== undefined
    }

    private isInviteeBody(body: any): boolean {
        return (body as InviteeBody)['id'] !== undefined
            && (body as InviteeBody)['allow'] !== undefined
            && (body as InviteeBody)['dateTime'] !== undefined
    }

    private isChatMessageBody(body: any): boolean {
        return (body as ChatMessage)['type'] !== undefined
            && (body as ChatMessage)['from'] !== undefined
            && (body as ChatMessage)['to'] !== undefined       
            && (body as ChatMessage)['body'] !== undefined       
    }
}
