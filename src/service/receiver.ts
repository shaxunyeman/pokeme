/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-12 12:06:49
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-31 10:37:49
 * @FilePath: /pokeme/src/service/receiver.ts
 * @Description: 
 */

import { PokeRequest } from "@/model/protocols";
import { Account } from "@/model/account";

export interface IReceiver {
    receive(to: Account): any[]
}
