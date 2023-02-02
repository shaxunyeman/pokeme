/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-14 16:00:43
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-02 15:13:29
 * @FilePath: /pokeme/src/service/dac/persistent.ts
 * @Description: 
 */

import { IAccount } from '@/service/dac/account';
import { ISendingQueuen } from '@/service/dac/sendingQueue';
import { IImapBoxInfo } from '@/service/dac/imapboxinfo';
import { IPokeMessage } from '@/service/dac/message';

export interface IPersistent {
    getIAccount(): IAccount;
    getISendingQueuen(): ISendingQueuen;
    getIImapBoxinfo(): IImapBoxInfo;
    getIPokeMessage(): IPokeMessage;
}
