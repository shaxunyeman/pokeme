/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-22 17:55:08
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-30 16:07:22
 * @FilePath: /pokeme/src/service/imap/imap.ts
 * @Description: 
 */

import Imap from 'imap';
import mailparser from 'mailparser';
import PubSub from 'pubsub-js';
import { ImapEndpoint } from '@/data/imapConfig';
import { Identifer } from '@/model/identifer';
import { ISensitivity } from '@/service/sensitivity';

export enum PokeImapConnectEvent {
    //  Emitted when a connection to the server has been made and authentication was successful
    CONNECTED = 'ready',
    // error(< Error >err) - Emitted when an error occurs. The 'source' property will be set to indicate 
    // where the error originated from
    ERROR = 'error',
    //close(< boolean >hadError) - Emitted when the connection has completely closed.
    DISCONNECTED = 'close',
    // end() - Emitted when the connection has ended.
    END = 'end',
    // data(<PokeEnvelope>pokeEnvelope) - Emitted when an envelope has been received
    DATA = 'data'
}

export interface PokeEnvelope {
    uid: number
    from: string | string[]
    to: string | string[]
    date: string | string[]
    subject: string | string[]
    data?: any
}

export type SubscriptionListener<T> = (message: string, data?: T) => void;

export class PokeImap {
    private imap: Imap;
    private uidNext: number;
    private openedBox?: Imap.Box;

    constructor(id: Identifer, sensitivity: ISensitivity, endpoint: ImapEndpoint) {
        this.uidNext = 0xFFFFFFFF;
        this.openedBox = undefined;
        
        const keepAlive: Imap.KeepAlive = {
            interval: 10000,
            idleInterval: 300000,
            forceNoop: false
        };

        this.imap = new Imap({
            user: id.mail,
            password: sensitivity.password(id),
            host: endpoint.host,
            port: endpoint.port,
            tls: endpoint.tls,
            keepalive: keepAlive,
            // debug: (log: any) => {
            //     console.log(log);
            // }
        });
    }

    public connect(): void {
        this.imap.on('mail', (numNew: number) => {
            // mail(< integer >numNewMsgs) - Emitted when new mail arrives in the currently open mailbox
            if(this.uidNext === 0xFFFFFFFF) {
                return;
            }

            if(this.openedBox === undefined) {
                return;
            }

            if(numNew === this.openedBox.messages.total) {
                return;
            }

            console.info(numNew, "new emails have arrived. uidnext: ", this.uidNext);
            let uids: number[] = new Array();
            for(let i = 0; i < numNew; i++) {
                uids.push(this.uidNext + i);
            }
            this.uidNext += numNew;

            uids.forEach((uid: number, _index: number) => {
                this.fetch(uid);
            })
        });

        this.imap.on('alert', (alter: string) => {
           // (< string >message) - Emitted when the server issues an alert 
           // (e.g. "the server is going down for maintenance"). 
        });

        this.imap.on('uidvalidity', (uidvalidity: number) => {
            // Emitted if the UID validity value for the currently open mailbox changes
        });

        this.imap.on('update', (seqno: number, info: any) => {
            // update(< integer >seqno, < object >info) - Emitted when message metadata (e.g. flags) changes externally
        })

        this.imap.on('expunge', (seqno: number) => {
            // expunge(< integer >seqno) - Emitted when a message was expunged externally. seqno is the sequence number 
            // (instead of the unique UID) of the message that was expunged. If you are caching sequence numbers, 
            // all sequence numbers higher than this value MUST be decremented by 1 in order to stay synchronized with the server 
            // and to keep correct continuity
        });
        this.imap.connect();
    }

    public disConnect(): void {
        this.imap.end();
    }

    public subscribe(event: PokeImapConnectEvent, listener: Function | SubscriptionListener<any>) {
        if(event === PokeImapConnectEvent.DATA) {
            PubSub.subscribe(event, listener as SubscriptionListener<any>);
        } else {
            this.imap.once(event, listener as Function);
        }
    }

    public async listBoxs(): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.imap.getBoxes((error, mailBoxes) => {
                if (error !== undefined) {
                    reject(error);
                } else {
                    let boxes: string[] = new Array();
                    for (let key in mailBoxes) {
                        boxes.push(key);
                    }
                    resolve(boxes);
                }
            })
        });
    }

    public async openBox(boxName: string): Promise<Imap.Box> {
        return new Promise((resolver, reject) => {
            this.imap.id({
                name: "pokeme",
                version: "1.0.0",
                vendor: 'destplus',
                'support-email': 'shaxunyeman@gmail.com',
            });
            this.imap.openBox(boxName, true, (error, box) => {
                if(error !== undefined) {
                    reject(error);
                } else {
                    this.openedBox = box;
                    this.uidNext = box.uidnext;
                    resolver(box);
                }
            });
        });
    }

    public async searchByOnly(since: string): Promise<any> {
        return new Promise((resolver, reject) => {
            this.imap.search(['UNSEEN', ['SINCE', `${since}`]], (error, uids) => {
                if(error !== undefined) {
                    reject(error);
                } else {
                    resolver(uids);
                }
            });
        })
    }

    public fetch(uid: any): void {
        let pokeEnvelope: PokeEnvelope = {
            uid: 0,
            from: [],
            to: [],
            date: [],
            subject: [],
            data: undefined
        };
        pokeEnvelope.uid = uid;

        const f = this.imap.fetch(uid, {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
            struct: false
        });

        console.debug("[imap] begin fetch", uid);
        f.on('message', (message: any, seqno: any) => {
            console.debug("[imap] handling", uid, "'s message");
            message.on('body', (stream: any, info: any) => {
                let data = '';
                let which = info.which;

                console.debug("[imap] handling", uid, "'s message body, which is", which);

                stream.on('data', (chunk: any) => {
                    console.debug("[imap] handling the chunk of", uid, "'s message body and chunk's size is", chunk.length);
                    data += chunk.toString('utf8');
                });
                stream.once('end', () => {
                    console.debug("[imap] handling", uid, "'s message body was end, which is", which);
                    if (which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)') {
                        const header = Imap.parseHeader(data);
                        pokeEnvelope.from = header.from;
                        pokeEnvelope.to = header.to;
                        pokeEnvelope.date = header.date;
                        pokeEnvelope.subject = header.subject;
                    } else if (which === 'TEXT') {
                        mailparser.simpleParser(data, { keepCidLinks: false }, (err, parsed) => {
                            if(err) {
                                console.error('[imap] parsing a mail was unsuccessful.');
                                console.error('[imap] parsing an error:', err.toString());
                            } else {
                                pokeEnvelope.data = parsed;
                                PubSub.publish(PokeImapConnectEvent.DATA, pokeEnvelope);
                            }
                        });
                    }
                });
            });
            message.once('attributes', (attributes: any) => {
                console.debug('[imap] handling', uid, "'s message attributes:", attributes);
            });
            message.once('end', () => {
                console.debug("[imap] handling", uid, "'s message was end.");
            });
        });

        f.once('error', (error: any) => {
            console.error("[imap] fetch", uid, "has encounted an error.");
            console.error("[imap] fetch", uid, "'s error:", error.toString());
        });

        f.once('end', () => {
            console.debug("[imap] finished fetch", uid);
        });
    }
}