/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-22 18:56:39
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-02 17:36:26
 * @FilePath: /pokeme/tests/unit/imap/imap.spec.ts
 * @Description: 
 */

import { PokeImap, PokeImapConnectEvent } from "@/service/imap/imap";
import { ImapDefualtConfig } from "@/data/mailConfigData";
import { TestAccount, TestSensitivity } from "../units";

// jest.setTimeout(60 * 1000);
describe('imap test cases', () => {
    it('using imap test case', async () => {
        await new Promise(async resolver => {
            const testA = TestAccount.generateId('826253116', '163.com');
            const testB = TestAccount.generateAccount('liuliu', 'peersafe.cn');
            const imap: PokeImap = new PokeImap(
                testA.id,
                new TestSensitivity(),
                ImapDefualtConfig['163.com']);
            imap.subscribe(PokeImapConnectEvent.CONNECTED, async () => {
                try {
                    const boxes = await imap.listBoxes();
                    expect(boxes.length).toBeGreaterThan(0);
                    await imap.openBox('INBOX');
                    const date = new Date('Sat Jan 28 2023');
                    const uids = await imap.searchByOnly(date.toDateString());
                    expect(uids.length).toBeGreaterThan(0);
                    imap.fetch(uids[0]);
                } catch (error: any) {
                    expect(false).toBeTruthy();
                } finally {
                    
                }
            });

            imap.subscribe(PokeImapConnectEvent.ERROR, async(error: any) => {
                console.error(error.toString());
                expect(false).toBeTruthy();
            });

            imap.subscribe(PokeImapConnectEvent.DISCONNECTED, async() => {
                resolver(PokeImapConnectEvent.DISCONNECTED);
            });

            imap.subscribe(PokeImapConnectEvent.DATA, async(message, envelope) => {
                expect(envelope.from.length).toBeGreaterThan(0);
                expect(envelope.data).toBeTruthy();
                imap.disConnect();
            });

            imap.subscribe(PokeImapConnectEvent.NEWMAIL, async(newNumber) => {
                expect(newNumber).toBeGreaterThan(0);
            });

            imap.connect();
        });
    })
})
