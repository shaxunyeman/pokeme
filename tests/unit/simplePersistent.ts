/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-19 15:27:07
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-20 22:20:27
 * @FilePath: /pokeme/tests/unit/simplePersistent.ts
 * @Description: 
 */

import { IPersistent } from "@/service/dac/persistent";
import { Account, IAccount } from '@/service/dac/account';
import { ISendingQueuen } from '@/service/dac/sendingQueue';
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

    public append(to: Account, data: any): PokeErrorCode {
        // only simulate a case should be unsuccessful when storaging a data
        if((data as MessageBody)['message'] !== undefined 
            && (data as MessageBody)['id'] !== undefined 
            && (data as MessageBody)['id'] === -1024) {
            return PokeErrorCode.STORAGE_ERROR;
        }

        let requests: any;
        if(this.requests.has(to.id)) {
            requests = this.requests.get(to.id);
        } else {
            requests = new Array();
        }
        requests.push(data);
        this.requests.set(to.id, requests);
        return PokeErrorCode.SUCCESS;
    }

    public retrive(who: Account): any[] {
        if (this.requests.has(who.id) === false) {
            return new Array();
        }

        const result = this.requests.get(who.id) as any[];
        this.requests.delete(who.id);
        return result;
    }

    public count(who: Account): number {
        const requests = this.requests.get(who.id);
        if(requests === undefined) {
            return 0;
        }
        return (requests as any[]).length;
    }
}

export class SimplePersistent implements IPersistent {
    private simpleAccount: SimpleAccount;
    private simpleSendingQueuen: SimpleSendingQueuen;

    constructor() {
        this.simpleAccount = new SimpleAccount();
        this.simpleSendingQueuen = new SimpleSendingQueuen();
    }

    public getAccount(): IAccount {
        return this.simpleAccount;
    }

    public getSendingQueuen(): ISendingQueuen {
        return this.simpleSendingQueuen;
    }
}