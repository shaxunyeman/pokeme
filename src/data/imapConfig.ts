/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-22 18:03:43
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-22 20:03:25
 * @FilePath: /pokeme/src/data/imapConfig.ts
 * @Description: 
 */

export interface ImapEndpoint {
    host: string
    port: number
    tls: boolean
}

type ImapConfig = Record<string, ImapEndpoint>;

export const ImapDefualtConfig: ImapConfig = {
    "peersafe.cn": {
        host: 'imap.qiye.aliyun.com',
        port: 993,
        tls: true,
    },
    "163.com": {
        host: 'imap.163.com',
        port: 993,
        tls: true
    },
    "qq.com": {
        host: 'imap.qq.com',
        port: 993,
        tls: true,
    }
}