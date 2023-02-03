/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-31 11:30:17
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-02 17:15:20
 * @FilePath: /pokeme/src/model/mailConfig.ts
 * @Description: 
 */
export interface ImapEndpoint {
    host: string
    port: number
    tls: boolean
}

export interface SmtpEndpoint {
    host: string
    port: number
    tls: boolean
}

export type ImapConfig = Record<string, ImapEndpoint>;
export type SmtpConfig = Record<string, SmtpEndpoint>;