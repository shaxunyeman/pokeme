/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-19 14:56:53
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-20 22:46:23
 * @FilePath: /pokeme/tests/unit/outbound.spec.ts
 * @Description: 
 */

import { Outbound } from "@/service/outBound";
import { JsonRSAWebTokenSigner, JsonRSAWebTokenVerifier } from "@/service/impl/jsonRSAWebToken";
import { RSASigner } from "@/service/impl/rsaSigner";
import { SimplePersistent, SimpleSendingQueuen } from "./simplePersistent";
import { Factory, TestAccount, sleep } from "./units";
import { SimpleTransporter } from "./simpleTransporter";
import { Account } from "@/service/dac/account";
import { PokeErrorCode } from "@/model/errorCodes";
import { ChatMessage, MessageBody, PokeCommand, PokeMessageType, PokeRequest } from "@/model/protocols";
import { ITransporter } from "@/service/transporter";
import { PokeRequestDecoder } from "@/service/requestTool";

describe('outbound test', () => {
    let persistent: SimplePersistent;
    beforeAll(() => {
        persistent = new SimplePersistent();
    })

    beforeEach(()=> {
        const accountTable = persistent.getAccount();
        accountTable.append(TestAccount.generateAccount('testA').account);
        accountTable.append(TestAccount.generateAccount('testB').account);
    })

    afterEach(() => {

    })

    it("outbound's flow on sending message normally", () => {
        const testA = TestAccount.generateId('testA');
        const testB = TestAccount.generateId('testB');
        const testC = TestAccount.generateId('testC');
        const factory: Factory = new Factory(
            testA.id,
            new RSASigner(testA.key.privateKey), 
            new JsonRSAWebTokenSigner(testA.key.privateKey));
        const outBound: Outbound = factory.newOutbound(new SimpleTransporter(), persistent);
        const msg = "hello, I'm pokeme."
        let result = outBound.sendChatMessage(testC.id, 1, msg);
        expect(result.code).toBe(PokeErrorCode.ACCOUNT_NOT_EXIST);

        result = outBound.sendChatMessage(testB.id, 1, msg);
        expect(result.code).toBe(PokeErrorCode.SUCCESS);

        // sending a data should put into a sending queuen firstly 
        const sendingQueuen: SimpleSendingQueuen = persistent.getSendingQueuen() as SimpleSendingQueuen;
        expect(sendingQueuen.count(testB.id)).toBe(1);

        result = outBound.sendChatMessage(testB.id, 2, msg);
        expect(result.code).toBe(PokeErrorCode.SUCCESS);
        expect(sendingQueuen.count(testB.id)).toBe(2);

        let msgs = sendingQueuen.retrive(testB.id);
        expect(msgs.length).toBe(2);
        expect(sendingQueuen.count(testB.id)).toBe(0);

        msgs.forEach((value: any, _index: number) => {
            expect((value as MessageBody)['message'] !== undefined).toBeTruthy();
        })

        result = outBound.sendInvite(testB.id, 'test description');
        msgs = sendingQueuen.retrive(testB.id);
        expect(msgs.length).toBe(1);
        expect(sendingQueuen.count(testB.id)).toBe(0);

        msgs.forEach((value: any, _index: number) => {
            expect((value as PokeRequest)['command']).toBe(PokeCommand.INVITER);
        })

        result = outBound.sendInvitee(testB.id, true, 'test description');
        msgs = sendingQueuen.retrive(testB.id);
        expect(msgs.length).toBe(1);
        expect(sendingQueuen.count(testB.id)).toBe(0);

        msgs.forEach((value: any, _index: number) => {
            expect((value as PokeRequest)['command']).toBe(PokeCommand.INVITEE);
        })
    })

    class testTrasporter implements ITransporter {
        private sentQueuen: Map<string, any[]>;
        constructor() {
            this.sentQueuen = new Map<string, any[]>;
        }

        public send(to:Account, data: any): any {
            let msgs :any[];
            if(this.sentQueuen.has(to.id)) {
                msgs = this.sentQueuen.get(to.id) as any[];
            } else {
                msgs = new Array();
            }
            msgs.push(data);
            this.sentQueuen.set(to.id, msgs);
        }

        public count(who: Account): number {
            if(this.sentQueuen.has(who.id) === false) {
                return 0;
            }

            const msgs: any[] = this.sentQueuen.get(who.id) as any[];
            return msgs.length;
        }

        public getRequest(who: Account, index: number): any {
            if(this.sentQueuen.has(who.id) === false) {
                return undefined;
            }

            const msgs: any[] = this.sentQueuen.get(who.id) as any[];
            if(msgs.length === 0 || index > msgs.length - 1) {
                return undefined;
            }

            return msgs[index];
        }
    };

    it('outbound sends requests directly', () => {
        // let sentQueuen: any[] = new Array();
        const testA = TestAccount.generateId('testA');
        const testB = TestAccount.generateId('testB');
        const factory: Factory = new Factory(
            testA.id,
            new RSASigner(testA.key.privateKey), 
            new JsonRSAWebTokenSigner(testA.key.privateKey));
        const transporter: testTrasporter = new testTrasporter();
        const outBound: Outbound = factory.newOutbound(transporter, persistent);
        // simulate storage a data was unsuccessful using msgid equal -1024
        const result = outBound.sendChatMessage(testB.id, -1024, 'storage_error');
        expect(result.code).toBe(PokeErrorCode.SUCCESS);
        const sendingQueuen: SimpleSendingQueuen = persistent.getSendingQueuen() as SimpleSendingQueuen;
        expect(sendingQueuen.count(testB.id)).toBe(0);
        expect(transporter.count(testB.id)).toBe(1);
    })

    it('a flow on starting a outbound', async() => {
        const testA = TestAccount.generateId('testA');
        const testB = TestAccount.generateId('testB');
        const factory: Factory = new Factory(
            testA.id,
            new RSASigner(testA.key.privateKey), 
            new JsonRSAWebTokenSigner(testA.key.privateKey));
        const transporter: testTrasporter = new testTrasporter();
        const outBound: Outbound = factory.newOutbound(transporter, persistent);

        const msg = "hello, I'm pokeme."
        let result = outBound.sendChatMessage(testB.id, 1, msg);
        expect(result.code).toBe(PokeErrorCode.SUCCESS);

        const msg2 = "hello, I'm pokeme too."
        result = outBound.sendChatMessage(testB.id, 2, msg2);
        expect(result.code).toBe(PokeErrorCode.SUCCESS);
        const sendingQueuen: SimpleSendingQueuen = persistent.getSendingQueuen() as SimpleSendingQueuen;
        expect(sendingQueuen.count(testB.id)).toBe(2);
        expect(transporter.count(testB.id)).toBe(0);

        outBound.start();
        await sleep(1500);
        expect(transporter.count(testB.id)).toBe(1);
        const request: PokeRequest = transporter.getRequest(testB.id, 0) as PokeRequest;
        expect(request.command).toBe(PokeCommand.MESSAGE);
        const decoder: PokeRequestDecoder = new PokeRequestDecoder(new JsonRSAWebTokenVerifier(testA.key.publicKey));
        const chatMessage: ChatMessage = decoder.decode(request) as ChatMessage;
        expect(chatMessage.body.length).toBe(2);
        outBound.stop();

        result = outBound.sendChatMessage(testB.id, 3, msg);
        expect(result.code).toBe(PokeErrorCode.SYSTEM_STOPPED);
    })
})
