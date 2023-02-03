/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-22 18:03:43
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-02 17:15:38
 * @FilePath: /pokeme/src/data/mailConfigData.ts
 * @Description: 
 */

import { SmtpConfig, ImapConfig } from "@/model/mailConfig"

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


export const SmtpDefualtConfig: SmtpConfig = {
    "peersafe.cn": {
        host: 'smtp.qiye.aliyun.com',
        port: 465,
        tls: true,
    },
    "163.com": {
        host: 'smtp.163.com',
        port: 465,
        tls: true
    },
    "qq.com": {
        host: 'smtp.qq.com',
        port: 465,
        tls: true,
    }
}