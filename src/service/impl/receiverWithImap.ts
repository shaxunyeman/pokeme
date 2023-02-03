/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-31 11:20:24
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-02 17:12:51
 * @FilePath: /pokeme/src/service/impl/receiverWithImap.ts
 * @Description: 
 */

import { IReceiver } from "@/service/receiver";
import { PokeImap, PokeImapConnectEvent, PokeEnvelope } from "@/service/imap/imap";
import { ISensitivity } from "@/service/sensitivity";
import { IPersistent } from "@/service/dac/persistent";
import { IImapBoxInfo } from "@/service/dac/imapboxinfo";
import { Account } from "@/model/account";
import { Identifer } from "@/model/identifer";
import { ImapEndpoint } from "@/model/mailConfig";

enum OpenBoxStatus {
    INIT,
    OPENING,
    OPENED,
}

export class ReceiverWithImap implements IReceiver {
    private id: Identifer;
    private persistent: IPersistent;
    private timerId!: NodeJS.Timer;
    private imap: PokeImap;
    private closed: boolean;
    private boxnames: string[];
    private selectBoxIndex: number;
    private selectedBoxName: string;
    private openingBoxStatus: number;

    constructor(id: Identifer, sensitivity: ISensitivity, persistent: IPersistent, endpoint: ImapEndpoint) {
        this.id = id;
        this.persistent = persistent;
        this.imap = new PokeImap(id, sensitivity, endpoint);
        this.closed = false;
        this.boxnames = new Array();
        this.selectBoxIndex = 0;
        this.selectedBoxName = '';
        this.openingBoxStatus = OpenBoxStatus.INIT; 
    }

    public open(): void {
        this.imap.subscribe(PokeImapConnectEvent.CONNECTED, this.handleConnected.bind(this));
        this.imap.subscribe(PokeImapConnectEvent.ERROR, this.handleConnectingError.bind(this));
        this.imap.subscribe(PokeImapConnectEvent.DISCONNECTED, this.handleDisConnected.bind(this));
        this.imap.subscribe(PokeImapConnectEvent.DATA, this.handleData.bind(this));
        this.imap.subscribe(PokeImapConnectEvent.NEWMAIL, this.handleNewArrivedMail.bind(this));
        this.imap.subscribe(PokeImapConnectEvent.END, this.handleConnectionEnd.bind(this));
        this.imap.connect();
    }

    public close(): void {
        if(this.timerId !== undefined) {
            this.closed = true;
        }
    }

    // override for IReceiver
    public receive(to: Account): any[] {
        return this.retriveEnvelope(to);
    }

    private async handleConnected() {
        console.info("[ReceiverWithImap] connected imap service.");

        const boxes = await this.imap.listBoxes();
        console.info("[ReceiverWithImap] got boxes:", boxes);

        boxes.forEach((boxname, _index) => {
            this.boxnames.push(boxname);
        })

        if(this.boxnames.length === 1) {
            this.openBoxes();
        } else {
            this.timerId = setTimeout(this.handleInterval.bind(this), 200);
        }
    }

    private handleConnectingError() {
        this.close();
    }

    private handleDisConnected() {

    }

    private handleConnectionEnd() {

    }

    private handleData(message: string, envelope: PokeEnvelope) {
        this.storageEnvelope(envelope);
    }

    private async handleNewArrivedMail(newNumber: number) {
        // when opening a box will emit a `mail` event
        // and then a new mail arrived also will emit a `mail` event
        if(this.openingBoxStatus === OpenBoxStatus.OPENING) {
            return;
        }

        console.debug(`[ReceiverWithImap] ${newNumber} new mails arrived.`);

        const imapInfoPersistent: IImapBoxInfo = this.persistent.getIImapBoxinfo();
        let boxinfo = imapInfoPersistent.get(this.id, this.selectedBoxName);
        if(boxinfo === undefined) {
            return;
        }
        for (let uidnext = boxinfo.uidnext;
            uidnext < boxinfo.uidnext + newNumber;
            uidnext++) {
            this.imap.fetch(uidnext);
        }
        boxinfo.total += newNumber;
        boxinfo.uidnext += newNumber;
        imapInfoPersistent.update(this.id, boxinfo);
    }

    private async handleInterval() {
        if(this.closed) {
            clearTimeout(this.timerId);
            this.imap.disConnect();
            return;
        }

        if(this.boxnames.length === 0) {
            return;
        }

        this.openBoxes();

        this.timerId = setTimeout(this.handleInterval.bind(this), this.calcNextInterVal());
    }

    private async openBoxes() {
        const selected: number = this.selectBoxIndex++ % this.boxnames.length;
        this.selectedBoxName = this.boxnames[selected];
        this.openingBoxStatus = OpenBoxStatus.OPENING;
        this.imap.openBox(this.selectedBoxName)
            .then((selectedBox) => {
                const imapInfoPersistent: IImapBoxInfo = this.persistent.getIImapBoxinfo();
                let boxinfo = imapInfoPersistent.get(this.id, this.selectedBoxName);
                if (boxinfo === undefined) {
                    let date = new Date();
                    date.setDate(date.getDate() - 7);
                    this.imap.searchByOnly(date.toDateString())
                        .then((uids) => {
                            uids.forEach((uid: number, _index: number) => {
                                // if fetched mail will emit `mail` events
                                this.imap.fetch(uid);
                            });
                        });

                    boxinfo = {
                        name: this.selectedBoxName,
                        total: selectedBox.messages.total,
                        uidnext: selectedBox.uidnext
                    };
                    imapInfoPersistent.save(this.id, boxinfo);
                } else {
                    const diff = selectedBox.uidnext - boxinfo.uidnext;
                    if (diff > 0) {
                        for (let uidnext = boxinfo.uidnext;
                            uidnext < boxinfo.uidnext + diff;
                            uidnext++) {
                            this.imap.fetch(uidnext);
                        }
                        boxinfo.name = this.selectedBoxName;
                        boxinfo.total = selectedBox.messages.total;
                        boxinfo.uidnext = selectedBox.uidnext;
                        imapInfoPersistent.update(this.id, boxinfo);
                    } 
                }
                this.openingBoxStatus = OpenBoxStatus.OPENED;
            })
            .catch((error) => {
                console.error("[ReceiverWithImap] open a box encounted an error:", error.toString());
            });
    }

    private calcNextInterVal(): number {
        const preSelected: number = (--this.selectBoxIndex) % this.boxnames.length;
        const boxname = this.boxnames[preSelected];
        console.debug("[ReceiverWithImap] pre-selected boxname:", boxname);
        if (boxname === 'INBOX') {
            return 60000; // 60 seconds
        } else if (boxname === '垃圾邮件'
            || boxname.toLowerCase() === '\junk'
            || boxname.toLowerCase() === 'junk') {
            return 30000; // 30 secodes
        }
        return 5000;
    }

    private storageEnvelope(envelope: PokeEnvelope) {
        let pokeMessageDB = this.persistent.getIPokeMessage();
        const mail = typeof envelope.from === 'string' ? envelope.from : envelope.from[0]
        const from: Account = {
            id: mail,
            mail: mail,
            name: '',
            publicKey: '',
        }
        if (pokeMessageDB.storage(from, envelope) === false) {
            console.error("[ReceiverWithImap] storage an envelope encounted an error. From:", mail);
        }
    }

    private retriveEnvelope(who: Account): PokeEnvelope[] {
        const pokeMessageDB = this.persistent.getIPokeMessage();
        return pokeMessageDB.retrive(who);
    }
}
