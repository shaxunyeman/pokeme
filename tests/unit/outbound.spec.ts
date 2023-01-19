/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-19 14:56:53
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-20 00:46:24
 * @FilePath: /pokeme/tests/unit/outbound.spec.ts
 * @Description: 
 */

import { Outbound } from "@/service/outBound";
import { JsonRSAWebTokenSigner } from "@/service/impl/jsonRSAWebToken";
import { RSASigner } from "@/service/impl/rsaSigner";
import { SimplePersistent, SimpleSendingQueuen } from "./simplePersistent";
import { Factory, TestAccount, sleep } from "./units";
import { SimpleTransporter } from "./simpleTransporter";
import { Account } from "@/service/dac/account";
import { PokeErrorCode } from "@/model/errorCodes";
import { MessageBody, PokeCommand, PokeMessageType, PokeRequest } from "@/model/protocols";
import { ITransporter } from "@/service/transporter";

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
        const factory: Factory = new Factory(
            testA.id,
            new RSASigner(testA.key.privateKey), 
            new JsonRSAWebTokenSigner(testA.key.privateKey));
        const outBound: Outbound = factory.newOutbound(new SimpleTransporter(), persistent);
        const msg = "hello, I'm pokeme."
        let result = outBound.sendChatMessage('testc@pokeme.com', 1, msg);
        expect(result.code).toBe(PokeErrorCode.ACCOUNT_NOT_EXIST);

        result = outBound.sendChatMessage(testB.id.id, 1, msg);
        expect(result.code).toBe(PokeErrorCode.SUCCESS);

        // sending a data should put into a sending queuen firstly 
        const sendingQueuen: SimpleSendingQueuen = persistent.getSendingQueuen() as SimpleSendingQueuen;
        expect(sendingQueuen.count(testB.id.id)).toBe(1);

        result = outBound.sendChatMessage(testB.id.id, 2, msg);
        expect(result.code).toBe(PokeErrorCode.SUCCESS);
        expect(sendingQueuen.count(testB.id.id)).toBe(2);

        let msgs = sendingQueuen.retrive(testB.id.id);
        expect(msgs.length).toBe(2);
        expect(sendingQueuen.count(testB.id.id)).toBe(0);

        msgs.forEach((value: any, _index: number) => {
            expect((value as MessageBody)['message'] !== undefined).toBeTruthy();
        })

        result = outBound.sendInvite(testB.id.id, 'test description');
        msgs = sendingQueuen.retrive(testB.id.id);
        expect(msgs.length).toBe(1);
        expect(sendingQueuen.count(testB.id.id)).toBe(0);

        msgs.forEach((value: any, _index: number) => {
            expect((value as PokeRequest)['command']).toBe(PokeCommand.INVITER);
        })

        result = outBound.sendInvitee(testB.id.id, true, 'test description');
        msgs = sendingQueuen.retrive(testB.id.id);
        expect(msgs.length).toBe(1);
        expect(sendingQueuen.count(testB.id.id)).toBe(0);

        msgs.forEach((value: any, _index: number) => {
            expect((value as PokeRequest)['command']).toBe(PokeCommand.INVITEE);
        })
    })

    class testTrasporter implements ITransporter {
        private sentQueuen: any[];
        constructor(sentQueuen: any[]) {
            this.sentQueuen = sentQueuen;
        }

        public send(data: any): any {
            this.sentQueuen.push(data);
        }
    };

    it('outbound send requests directly', () => {
        let sentQueuen: any[] = new Array();
        const testA = TestAccount.generateId('testA');
        const testB = TestAccount.generateId('testB');
        const factory: Factory = new Factory(
            testA.id,
            new RSASigner(testA.key.privateKey), 
            new JsonRSAWebTokenSigner(testA.key.privateKey));
        const outBound: Outbound = factory.newOutbound(new testTrasporter(sentQueuen), persistent);
        // simulate storage a data was unsuccessful using msgid equal -1024
        const result = outBound.sendChatMessage(testB.id.id, -1024, 'storage_error');
        expect(result.code).toBe(PokeErrorCode.SUCCESS);
        const sendingQueuen: SimpleSendingQueuen = persistent.getSendingQueuen() as SimpleSendingQueuen;
        expect(sendingQueuen.count(testB.id.id)).toBe(0);
        expect(sentQueuen.length).toBe(1);
    })

    it('a flow on starting a outbound', async() => {
        let sentQueuen: any[] = new Array();
        const testA = TestAccount.generateId('testA');
        const testB = TestAccount.generateId('testB');
        const factory: Factory = new Factory(
            testA.id,
            new RSASigner(testA.key.privateKey), 
            new JsonRSAWebTokenSigner(testA.key.privateKey));
        const outBound: Outbound = factory.newOutbound(new testTrasporter(sentQueuen), persistent);
        const msg = "hello, I'm pokeme."
        let result = outBound.sendChatMessage(testB.id.id, 1, msg);
        expect(result.code).toBe(PokeErrorCode.SUCCESS);
        const sendingQueuen: SimpleSendingQueuen = persistent.getSendingQueuen() as SimpleSendingQueuen;
        expect(sendingQueuen.count(testB.id.id)).toBe(1);
        expect(sentQueuen.length).toBe(0);

        outBound.start();
        await sleep(1500);
        expect(sentQueuen.length).toBe(1);
        outBound.stop();

        result = outBound.sendChatMessage(testB.id.id, 2, msg);
        expect(result.code).toBe(PokeErrorCode.SYSTEM_STOPPED);
    })
})
