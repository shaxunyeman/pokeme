/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-14 16:03:51
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-20 22:15:53
 * @FilePath: /pokeme/src/service/dac/sendingQueue.ts
 * @Description: 
 */

import { PokeErrorCode } from "@/model/errorCodes";
import { PokeRequest } from "@/model/protocols";
import { Account } from "@/service/dac/account";

export interface ISendingQueuen {
    append(to: Account, data: any): PokeErrorCode 
    retrive(who: Account): any[]
}
