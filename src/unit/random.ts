/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-13 16:10:37
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-13 16:16:24
 * @FilePath: /pokeme/src/unit/random.ts
 * @Description: 
 */

export class Random {
    public static passphrase(length: number): string {
        var result = '';
        var characters = '`~!@#$%^&*()_+|><?/ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}