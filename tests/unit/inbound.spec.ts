/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-21 15:24:00
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-03 14:47:38
 * @FilePath: /pokeme/tests/unit/inbound.spec.ts
 * @Description: 
 */

import { Factory, sleep, TestAccount } from "./units";
import { IReceiver } from "@/service/receiver";
import { Account } from "@/model/account";
import { JsonRSAWebTokenSigner, JsonRSAWebTokenVerifier } from "@/service/impl/jsonRSAWebToken";
import { RSASigner } from "@/service/impl/rsaSigner";
import { SimplePersistent } from "./simplePersistent";
import { Inbound, InboundEventType } from "@/service/inBound";
import { PokeRequestDecoder } from "@/service/requestTool";
import { ChatMessage, InviteeBody, InviterBody, MessageBody, PokeMessageType } from "@/model/protocols";

describe('inbound test', () => {
    class TestReceiver implements IReceiver {
        private received: Map<string, any[]>;

        constructor(received: Map<string, any[]>) {
            this.received = received;
        }

        public receive(to: Account): any[] {
            if(this.received.has(to.id) === false) {
                return new Array();
            }
            return this.received.get(to.id) as any[];
        }
    }

    let persistent: SimplePersistent;
    beforeAll(() => {
        persistent = new SimplePersistent();
    })

    beforeEach(()=> {
        const accountTable = persistent.getIAccount();
        accountTable.append(TestAccount.generateAccount('testA').account);
        accountTable.append(TestAccount.generateAccount('testB').account);
    })

    it("inbound's flow on receiving messages normally", async() => {
        let fakeReceived = new Map<string, any[]>();
        const testA = TestAccount.generateAccount('testA');
        const testB = TestAccount.generateAccount('testB');

        const factory: Factory = new Factory(
            testA.account,
            new RSASigner(testA.key.privateKey), 
            new JsonRSAWebTokenSigner(testA.key.privateKey));
        
        let requests = new Array();
        const invite = factory.newInviteRequest();
        requests.push(invite.request);

        const allowInvitee = factory.newInviteeRequest(testB.account, true);
        requests.push(allowInvitee.request);

        const refuseInvitee = factory.newInviteeRequest(testB.account, false);
        requests.push(refuseInvitee.request);

        const chatMessage = factory.newMessage(testB.account, "1", "pokeme blesses your happy new year.");
        requests.push(chatMessage.request);

        fakeReceived.set(testB.account.id, requests);

        const testReceiver: TestReceiver = new TestReceiver(fakeReceived);
        const inbound: Inbound = factory.newInbound(new JsonRSAWebTokenVerifier(testA.key.publicKey), testReceiver, persistent);

        const decoder: PokeRequestDecoder = new PokeRequestDecoder(new JsonRSAWebTokenVerifier(testA.key.publicKey));
        inbound.subscribe(InboundEventType.INVITER, (message: string, data?: any) => {
            const expectValue: InviterBody = decoder.decode(invite.request);
            const realValue: InviterBody = data.inviter as InviterBody;
            expect(realValue.id).toBe(expectValue.id);
            expect(realValue.mail).toBe(expectValue.mail);
            expect(realValue.dateTime).toBe(expectValue.dateTime);
        });

        inbound.subscribe(InboundEventType.INVITEE, (message: string, data?: any) => {
            const realValue: InviteeBody = data.invitee as InviteeBody;
            if(realValue.allow) {
                const expectValue: InviteeBody = decoder.decode(allowInvitee.request);
                expect(expectValue.allow).toBeTruthy();
                expect(realValue.id).toBe(expectValue.id);
                expect(realValue.dateTime).toBe(expectValue.dateTime);
            } else {
                const expectValue: InviteeBody = decoder.decode(refuseInvitee.request);
                expect(expectValue.allow).toBeFalsy();
                expect(realValue.id).toBe(expectValue.id);
                expect(realValue.dateTime).toBe(expectValue.dateTime);
            }
        });

        inbound.subscribe(InboundEventType.SINGLE_MESSAGE, (message: string, data?: any) => {
            const expectValue: ChatMessage = data.chatMessage as ChatMessage;
            const realValue: ChatMessage = decoder.decode(chatMessage.request);
            expect(realValue.type).toBe(PokeMessageType.SINGLE_CHAT);
            expect(realValue.from).toBe(testA.account.id);
            expect(realValue.to).toBe(testB.account.id);
            expect(realValue.body.length).toBe(1);
            expect(expectValue.body.length).toBe(1);

            const expectMessageBody: MessageBody = expectValue.body[0];
            const realMessageBody: MessageBody = realValue.body[0];
            expect(realMessageBody.id).toBe(expectMessageBody.id);
            expect(realMessageBody.message).toBe(expectMessageBody.message);
            expect(realMessageBody.dateTime).toBe(expectMessageBody.dateTime);
        });

        inbound.subscribe(InboundEventType.GROUP_MESSAGE, (message: string, data?: any) => {
            expect('not implement group chat').toBeFalsy();
        })

        inbound.start();
        await sleep(1500);
    })
})