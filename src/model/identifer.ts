/*
 * @Author: liuliu
 * @Date: 2023-01-02 12:00:00
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-05 23:50:10
 * @FilePath: /i-free-talk/src/model/identifer.ts
 * @Description: iedentifer for person
 */

export interface KeyPair {
    public: string
    private: string
    algorithm: string
}

export interface Identifer {
    id: string
    mail: string
    publicKey: string
    name: string
}