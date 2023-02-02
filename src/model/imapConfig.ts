/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-31 11:30:17
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-31 11:31:24
 * @FilePath: /pokeme/src/model/imapConfig.ts
 * @Description: 
 */
export interface ImapEndpoint {
    host: string
    port: number
    tls: boolean
}

export type ImapConfig = Record<string, ImapEndpoint>;