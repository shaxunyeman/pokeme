/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-13 17:25:16
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-20 00:14:46
 * @FilePath: /pokeme/src/model/errorCodes.ts
 * @Description: 
 */


export enum PokeErrorCode {
    NONE = -1,
    SUCCESS = 0,
    
    // System
    SYSTEM_STOPPED = 1000,

    // Account
    ACCOUNT_NOT_EXIST = 2000,

    // Storage
    STORAGE_ERROR = 3000
}