/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-14 16:03:51
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-03 14:28:46
 * @FilePath: /pokeme/src/service/dac/sendingQueue.ts
 * @Description: 
 */

import { PokeErrorCode } from "@/model/errorCodes";
import { PokeRequest } from "@/model/protocols";
import { Account } from "@/model/account";

export enum SentStatus {
    UNSEND,
    SENDING,
    SENTOK,
    SENTFAULT
}

export interface ISendingQueuen {
    append(to: Account, id:string, data: any): PokeErrorCode 
    retrive(who: Account): {id:string,data:any}[]
    feedBack(id:string, status: SentStatus):void;
}
