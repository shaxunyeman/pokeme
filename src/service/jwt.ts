/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-02 18:42:05
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-12 13:52:01
 * @FilePath: /pokeme/src/service/jwt.ts
 * @Description: 
 */

import { PokeJwtPayload } from "@/model/jwtPayload"

export interface IJwtSigner {
    sign(payload: string | object): string
}

export interface IJwtVerifier {
    verify(token: string): PokeJwtPayload | string
}
