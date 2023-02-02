/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-12 12:04:16
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-31 10:37:57
 * @FilePath: /pokeme/src/service/transporter.ts
 * @Description: 
 */

import { Account } from "@/model/account";

export interface ITransporter {
    send(to:Account, data: any): any
}