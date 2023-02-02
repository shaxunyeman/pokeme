/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-22 18:31:39
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-31 10:37:54
 * @FilePath: /pokeme/src/service/sensitivity.ts
 * @Description: 
 */

import { Account } from "@/model/account";

export interface ISensitivity {
    password(who: Account): string
}