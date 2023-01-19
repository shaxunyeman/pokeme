/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-14 16:03:51
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-19 23:23:33
 * @FilePath: /pokeme/src/service/dac/sendingQueue.ts
 * @Description: 
 */

import { PokeErrorCode } from "@/model/errorCodes";
import { PokeRequest } from "@/model/protocols";

export interface ISendingQueuen {
    append(to: string, data: any): PokeErrorCode 
    retrive(who: string): any[]
}
