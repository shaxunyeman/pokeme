/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-19 15:27:07
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-03 14:41:03
 * @FilePath: /pokeme/tests/unit/simplePersistent.ts
 * @Description: 
 */

import { IPersistent } from "@/service/dac/persistent";
import { IAccount } from '@/service/dac/account';
import { ISendingQueuen, SentStatus } from '@/service/dac/sendingQueue';
import { IImapBoxInfo } from "@/service/dac/imapboxinfo";
import { IPokeMessage } from '@/service/dac/message';
import { Account } from "@/model/account";
import { ImapBoxInfo } from "@/model/accountImapInfo";
import { PokeErrorCode } from "@/model/errorCodes";
import { PokeRequest, PokeCommand, MessageBody } from "@/model/protocols";

export class SimpleAccount implements IAccount {

    private accounts: Map<string, Account>;

    constructor() {
        this.accounts = new Map<string, Account>();
    }

    public append(account: Account): number {
        this.accounts.set(account.id, account);
        return 0;
    }

    public get(id: string): Account | undefined {
        return this.accounts.get(id);
    }

    public getAll(): Account[] {
        let accounts: Account[] = new Array();
        const accountIterator = this.accounts.values();
        for(let account of accountIterator) {
            accounts.push(account);
        }

        return accounts;
    }

    public has(id: string): boolean {
        return this.accounts.has(id);
    }

    public delete(id: string): number {
        return 0;
    }
}

export class SimpleSendingQueuen implements ISendingQueuen {

    private requests: Map<string, any[]>;

    constructor() {
        this.requests = new Map<string, any[]>();
    }

    public append(to: Account, id: string, data: any): PokeErrorCode {
        // only simulate a case should be unsuccessful when storaging a data
        if((data as MessageBody)['message'] !== undefined 
            && (data as MessageBody)['id'] !== undefined 
            && (data as MessageBody)['id'] === '-1024') {
            return PokeErrorCode.STORAGE_ERROR;
        }

        let requests: any;
        if(this.requests.has(to.id)) {
            requests = this.requests.get(to.id);
        } else {
            requests = new Array();
        }
        requests.push({id: id, data: data});
        this.requests.set(to.id, requests);
        return PokeErrorCode.SUCCESS;
    }

    public retrive(who: Account): {id:string,data:any}[] {
        if (this.requests.has(who.id) === false) {
            return new Array();
        }

        const result = this.requests.get(who.id) as any[];
        this.requests.delete(who.id);
        return result;
    }

    public feedBack(id:string, status: SentStatus):void {

    }

    public count(who: Account): number {
        const requests = this.requests.get(who.id);
        if(requests === undefined) {
            return 0;
        }
        return (requests as any[]).length;
    }
}

export class SimpleImapInfo implements IImapBoxInfo {
    private boxinfos: Map<string, Map<string, ImapBoxInfo>>;

    constructor() {
        this.boxinfos = new Map<string, Map<string, ImapBoxInfo>>();
    }

    public save(who: Account, boxinfo: ImapBoxInfo): boolean {
        let boxinfos = this.boxinfos.get(who.mail);
        if(boxinfos === undefined) {
            boxinfos = new Map<string, ImapBoxInfo>();
        } 
        boxinfos.set(boxinfo.name, boxinfo);
        this.boxinfos.set(who.mail, boxinfos);
        return true;
    }

    public update(who: Account, boxinfo: ImapBoxInfo): boolean {
        const infos = this.boxinfos.get(who.mail);
        if(infos === undefined) {
            return false;
        }

        const info = infos.get(boxinfo.name);
        if(info === undefined) {
            return false;
        }
        infos.set(boxinfo.name, boxinfo);
        this.boxinfos.set(who.mail, infos);
        return true;
    }

    public get(who: Account, boxname: string): ImapBoxInfo | undefined {
        const infos = this.boxinfos.get(who.mail);
        if(infos === undefined) {
            return undefined;
        }

        const info = infos.get(boxname);
        if(info === undefined) {
            return undefined;
        }
        return info;
    }

    public getAll(who: Account): ImapBoxInfo[] {
        const infos = this.boxinfos.get(who.mail);
        if(infos === undefined) {
            return new Array();
        }

        let boxes = new Array();
        infos.forEach((box, _key) => {
            boxes.push(box);
        })
        return boxes;
    }

    public lastUpdateTime(): string {
        const date = new Date();
        return date.toDateString();
    }
}

export class SimplePokeMessage implements IPokeMessage {
    public storage(from: Account, data:any): boolean {
        return false;
    }

    public retrive(who: Account): any[] {
        return new Array();
    }
}

export class SimplePersistent implements IPersistent {
    private simpleAccount: SimpleAccount;
    private simpleSendingQueuen: SimpleSendingQueuen;
    private simpleImapInfo: SimpleImapInfo;
    private simplePokeMessage: SimplePokeMessage;

    constructor() {
        this.simpleAccount = new SimpleAccount();
        this.simpleSendingQueuen = new SimpleSendingQueuen();
        this.simpleImapInfo = new SimpleImapInfo();
        this.simplePokeMessage = new SimplePokeMessage();
    }

    public getIAccount(): IAccount {
        return this.simpleAccount;
    }

    public getISendingQueuen(): ISendingQueuen {
        return this.simpleSendingQueuen;
    }

    public getIImapBoxinfo(): IImapBoxInfo {
        return this.simpleImapInfo;
    }

    public getIPokeMessage(): IPokeMessage {
        return this.simplePokeMessage;
    }
}
