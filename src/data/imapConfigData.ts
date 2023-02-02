/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-22 18:03:43
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-31 11:31:53
 * @FilePath: /pokeme/src/data/imapConfigData.ts
 * @Description: 
 */

import { ImapEndpoint, ImapConfig } from "@/model/imapConfig"

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