/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-13 16:59:27
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-13 17:23:55
 * @FilePath: /pokeme/src/service/dac/account.ts
 * @Description: 
 */

export interface Account {
    id: string
    mail: string
    name: string
    publicKey: string
    msgId: number
}

export interface IAccount {
    setAccount(account: Account): number;
    getAccount(id: string): Account | undefined
}
