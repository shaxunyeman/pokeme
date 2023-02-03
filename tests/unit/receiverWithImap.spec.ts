/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-31 16:46:00
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-02 17:14:31
 * @FilePath: /pokeme/tests/unit/receiverWithImap.spec.ts
 * @Description: 
 */

import { ReceiverWithImap } from '@/service/impl/receiverWithImap';
import { ImapDefualtConfig } from "@/data/mailConfigData";
import { TestAccount, TestSensitivity } from "./units";
import { SimplePersistent, SimpleImapInfo } from "./simplePersistent";
import { sleep } from './units';

let mockListBoxes = jest.fn();
let mockOpenBox = jest.fn((name):any => {});
let mockSearchByOnly = jest.fn((since):any => {});
let mockFecth = jest.fn((uid) => {});
let mockSubscribe = jest.fn((event, f) => {});
let mockConnect = jest.fn();

jest.mock('@/service/imap/imap', () => {
    const origin = jest.requireActual('@/service/imap/imap');
    return {
        ...origin,
        PokeImap: jest.fn().mockImplementation(() => {
            return {
                listBoxes: mockListBoxes,
                openBox: mockOpenBox,
                searchByOnly: mockSearchByOnly,
                fetch: mockFecth,
                subscribe: mockSubscribe,
                connect: mockConnect,
            }
        })
    }
})

jest.setTimeout(60 * 1000);
describe('receiverWithImap test cases', () => {

    const simplePersistent = new SimplePersistent();

    beforeAll(() => {
        mockListBoxes.mockClear();
        mockOpenBox.mockClear();
        mockSearchByOnly.mockClear();
        mockFecth.mockClear();
        mockSubscribe.mockClear();
        mockConnect.mockClear();
    })

    test(("open receiver"), () => {
        const testA = TestAccount.generateId('826253116', '163.com');
        const receiver = new ReceiverWithImap(testA.id, new TestSensitivity(), new SimplePersistent(), ImapDefualtConfig['163.com']);
        receiver.open();
        expect(mockConnect).toBeCalledTimes(1);
        expect(mockSubscribe).toBeCalledTimes(6);
    })

    test("A normal flow of the receiver startup initially", async() => {
        let subscribes = new Map<string, any>();
        let promises: Promise<any>[] = new Array();
        const boxes = ["INBOX"];
        const uids = [10000,10001];
        let receiveduids: number[] = new Array();
        promises.push(new Promise(resolver => {
            setInterval(() => {
                if (receiveduids.length > 0 && receiveduids[0] === 10000) {
                    resolver(receiveduids[0]);
                }
            }, 200);
        }));

        promises.push(new Promise(resolver => {
            setInterval(() => {
                if (receiveduids.length > 1 && receiveduids[1] === 10001) {
                    resolver(receiveduids[1]);
                }
            }, 200);

        }));

        mockSubscribe = jest.fn((event, f) => {
            subscribes.set(event, f);
        });

        mockConnect = jest.fn(() => {
            // emit connected event
            subscribes.get('ready')();
        });

        mockListBoxes = jest.fn(() => {
            return new Promise(resolver => resolver(boxes));
        });

        mockOpenBox = jest.fn((name):any => {
            return new Promise(resolver => {
                resolver({
                    name: name,
                    newKeywords: false,
                    uidvalidity: 0,
                    uidnext: 100,
                    flags: [],
                    permFlags: [],
                    persistentUIDs: false,
                    messages: {
                        total: 110,
                        new: 0
                    }
                });
            });
        });

        mockSearchByOnly = jest.fn((since):any => {
            // console.log("mockSeachByOnly:", since);
            return new Promise(resolver => {
                resolver(uids);
            });
        });

        let index = 0;
        mockFecth = jest.fn((uid) => {
            // console.log("mockFetch:", uid);
            receiveduids[index++] = uid;
        });

        const testA = TestAccount.generateId('826253116', '163.com');
        const receiver = new ReceiverWithImap(testA.id, new TestSensitivity(), simplePersistent, ImapDefualtConfig['163.com']);
        receiver.open();
        expect(mockConnect).toBeCalledTimes(1);
        expect(mockSubscribe).toBeCalledTimes(6);
        await Promise.all(promises);
        expect(mockListBoxes).toBeCalledTimes(1);
        expect(mockOpenBox).toBeCalledTimes(1);
        expect(mockOpenBox.mock.calls[0][0]).toBe("INBOX");

        expect(mockSearchByOnly).toBeCalledTimes(1);
        let date = new Date();
        date.setDate(date.getDate() - 7);
        expect(mockSearchByOnly.mock.calls[0][0]).toBe(date.toDateString());

        expect(mockFecth).toBeCalledTimes(2);
        expect(mockFecth.mock.calls[0][0]).toBe(uids[0]);
        expect(mockFecth.mock.calls[1][0]).toBe(uids[1]);

        const boxinfo = simplePersistent.getIImapBoxinfo().get(testA.id, "INBOX");
        expect(boxinfo).toBeTruthy();
        expect(boxinfo?.name).toBe("INBOX");
        expect(boxinfo?.total).toBe(110);
        expect(boxinfo?.uidnext).toBe(100);
    })

    test("A normal flow of the receiver after starting up initially", async() => {
        let subscribes = new Map<string, any>();
        let promises: Promise<any>[] = new Array();
        const boxes = ["INBOX"];
        let receiveduids: number[] = new Array();
        promises.push(new Promise(resolver => {
            setInterval(() => {
                if (receiveduids.length > 0 && receiveduids[0] === 100) {
                    resolver(receiveduids[0]);
                }
            }, 200);
        }));
        promises.push(new Promise(resolver => {
            setInterval(() => {
                if (receiveduids.length > 0 && receiveduids[1] === 101) {
                    resolver(receiveduids[0]);
                }
            }, 200);
        }));
        mockSubscribe = jest.fn((event, f) => {
            subscribes.set(event, f);
        });

        mockConnect = jest.fn(() => {
            // emit connected event
            subscribes.get('ready')();
        });

        mockSearchByOnly = jest.fn((since):any => {});

        mockListBoxes = jest.fn(() => {
            return new Promise(resolver => resolver(boxes));
        });

        mockOpenBox = jest.fn((name):any => {
            return new Promise(resolver => {
                resolver({
                    name: name,
                    newKeywords: false,
                    uidvalidity: 0,
                    uidnext: 102,
                    flags: [],
                    permFlags: [],
                    persistentUIDs: false,
                    messages: {
                        total: 113,
                        new: 0
                    }
                });
            });
        });

        let index = 0;
        mockFecth = jest.fn((uid) => {
            receiveduids[index++] = uid;
        });

        const testA = TestAccount.generateId('826253116', '163.com');
        const receiver = new ReceiverWithImap(testA.id, new TestSensitivity(), simplePersistent, ImapDefualtConfig['163.com']);
        receiver.open();
        expect(mockConnect).toBeCalledTimes(1);
        expect(mockSubscribe).toBeCalledTimes(6);
        await Promise.all(promises);
        expect(mockListBoxes).toBeCalledTimes(1);

        expect(mockOpenBox).toBeCalledTimes(1);
        expect(mockOpenBox.mock.calls[0][0]).toBe("INBOX");

        expect(mockSearchByOnly).toBeCalledTimes(0);

        expect(mockFecth).toBeCalledTimes(2);
        expect(mockFecth.mock.calls[0][0]).toBe(100);
        expect(mockFecth.mock.calls[1][0]).toBe(101);

        const boxinfo = simplePersistent.getIImapBoxinfo().get(testA.id, "INBOX");
        expect(boxinfo).toBeTruthy();
        expect(boxinfo?.name).toBe("INBOX");
        expect(boxinfo?.total).toBe(113);
        expect(boxinfo?.uidnext).toBe(102);
    })

    test("A new arrived mail with mismatching OpenBoxStatus", ()=> {
        let subscribes = new Map<string, any>();

        mockSubscribe = jest.fn((event, f) => {
            subscribes.set(event, f);
        });

        mockConnect = jest.fn(() => {});
        mockSearchByOnly = jest.fn((since):any => {});
        mockListBoxes = jest.fn(() => {}); 
        mockOpenBox = jest.fn((name):any => {});
        mockFecth = jest.fn((uid) => {});

        const testA = TestAccount.generateId('826253116', '163.com');
        const receiver = new ReceiverWithImap(testA.id, new TestSensitivity(), simplePersistent, ImapDefualtConfig['163.com']);
        receiver.open();
        expect(mockConnect).toBeCalledTimes(1);
        expect(mockSubscribe).toBeCalledTimes(6);

        subscribes.get('mail')(4);
        expect(mockSearchByOnly).toBeCalledTimes(0);
        expect(mockListBoxes).toBeCalledTimes(0);
        expect(mockOpenBox).toBeCalledTimes(0);
        expect(mockFecth).toBeCalledTimes(0);
    })

    test("A new arrived mail with matching OpenBoxStatus", async()=> {
        let subscribes = new Map<string, any>();
        const boxes = ["INBOX"];
        let promises: Promise<any>[] = new Array();
        let receiveduids: number[] = new Array();
        promises.push(new Promise(resolver => {
            setInterval(() => {
                if (receiveduids.length > 0 && receiveduids[0] === 102) {
                    resolver(receiveduids[0]);
                }
            }, 200);
        }));

        mockSubscribe = jest.fn((event, f) => {
            subscribes.set(event, f);
        });

        mockConnect = jest.fn(() => {
            subscribes.get('ready')();
        });

        mockSearchByOnly = jest.fn((since):any => {});
        mockListBoxes = jest.fn(() => {
            return new Promise(resolver => resolver(boxes));
        });
        mockOpenBox = jest.fn((name):any => {
            return new Promise(resolver => {
                resolver({
                    name: name,
                    newKeywords: false,
                    uidvalidity: 0,
                    uidnext: 103,
                    flags: [],
                    permFlags: [],
                    persistentUIDs: false,
                    messages: {
                        total: 114,
                        new: 0
                    }
                });
            });
        });
        mockFecth = jest.fn((uid) => {
            // uid: 102,103
            receiveduids.push(uid);
        });

        const testA = TestAccount.generateId('826253116', '163.com');
        const receiver = new ReceiverWithImap(testA.id, new TestSensitivity(), simplePersistent, ImapDefualtConfig['163.com']);
        receiver.open();
        expect(mockConnect).toBeCalledTimes(1);
        expect(mockSubscribe).toBeCalledTimes(6);

        await Promise.all(promises);
        expect(mockSearchByOnly).toBeCalledTimes(0);
        expect(mockListBoxes).toBeCalledTimes(1);
        expect(mockOpenBox).toBeCalledTimes(1);
        expect(mockFecth).toBeCalledTimes(1);


        // A new mail arrived
        subscribes.get('mail')(1);
        expect(mockFecth).toBeCalledTimes(2);
        const boxinfo = simplePersistent.getIImapBoxinfo().get(testA.id, "INBOX");
        expect(boxinfo).toBeTruthy();
        expect(boxinfo?.name).toBe("INBOX");
        expect(boxinfo?.total).toBe(115);
        expect(boxinfo?.uidnext).toBe(104);
    })
})