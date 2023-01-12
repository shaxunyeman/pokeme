/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-02 18:12:18
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-05 23:35:47
 * @FilePath: /i-free-talk/src/model/signer.ts
 * @Description: 
 */

export interface ISigner {
    sign(payload: string | object): string
}

export interface IVerifier {
    verify(token: string, signature: string): boolean
}