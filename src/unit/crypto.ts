/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-07 10:46:41
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-07 15:55:04
 * @FilePath: /i-free-talk/src/unit/crypto.ts
 * @Description: 
 */

import * as crypto from "crypto";

export function sha256(chunk: any):string {
    const hmac = crypto.createHash('sha256');
    hmac.write(chunk);
    hmac.end();
    return hmac.read().toString('hex');
}
