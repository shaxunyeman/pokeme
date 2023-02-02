/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-31 10:17:31
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-01 15:15:20
 * @FilePath: /pokeme/src/model/accountImapInfo.ts
 * @Description: 
 */

import { Account } from "@/model/account";

export interface ImapBoxInfo {
    name: string
    total: number
    uidnext: number
}