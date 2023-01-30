/*
 * @Author: liuliu
 * @Date: 2023-01-02 12:00:00
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-22 18:27:55
 * @FilePath: /pokeme/src/model/identifer.ts
 * @Description: iedentifer for person
 */

import { Account } from "@/service/dac/account"

export interface KeyPair {
    public: string
    private: string
    algorithm: string
}

export type Identifer = Account