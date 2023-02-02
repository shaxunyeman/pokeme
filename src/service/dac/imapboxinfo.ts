/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-31 14:26:15
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-31 14:49:00
 * @FilePath: /pokeme/src/service/dac/imapboxinfo.ts
 * @Description: 
 */

import { ImapBoxInfo } from "@/model/accountImapInfo";
import { Account } from "@/model/account";

export interface IImapBoxInfo {
    /**
     * @description: 
     * @return {*}
     */    
    save(who: Account, boxinfo: ImapBoxInfo): boolean;

    /**
     * @description: 
     * @return {*}
     */    
    update(who: Account, boxinfo: ImapBoxInfo): boolean;

    /**
     * @description: 
     * @return {*} if who has't boxinfo in boxname, must return undefined, otherwise return boxinfo
     */    
    get(who: Account, boxname: string): ImapBoxInfo | undefined

    /**
     * @description: 
     * @return {*}
     */    
    getAll(who: Account): ImapBoxInfo[]

    /**
     * @description: 
     * @return {*}
     */    
    lastUpdateTime(): string
}