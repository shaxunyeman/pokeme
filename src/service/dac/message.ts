/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-02-02 15:10:25
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-02 15:12:45
 * @FilePath: /pokeme/src/service/dac/message.ts
 * @Description: 
 */

import { Account } from "@/model/account";

export interface IPokeMessage {
    storage(from: Account, data:any): boolean;
    retrive(who: Account): any[];
}