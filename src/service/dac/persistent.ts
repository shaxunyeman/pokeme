/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-14 16:00:43
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-19 15:29:48
 * @FilePath: /pokeme/src/service/dac/persistent.ts
 * @Description: 
 */

import { IAccount } from '@/service/dac/account';
import { ISendingQueuen } from '@/service/dac/sendingQueue';

export interface IPersistent {
    getAccount(): IAccount 
    getSendingQueuen(): ISendingQueuen
}
