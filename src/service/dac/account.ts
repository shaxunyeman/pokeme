/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-13 16:59:27
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-19 20:59:31
 * @FilePath: /pokeme/src/service/dac/account.ts
 * @Description: 
 */

export interface Account {
    id: string
    mail: string
    name: string
    publicKey: string
}

export interface IAccount {
    append(account: Account): number;
    get(id: string): Account | undefined
    getAll(): Account[]
    has(id: string): boolean;
    delete(id: string): number
}
