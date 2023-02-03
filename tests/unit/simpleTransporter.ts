/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-19 15:25:30
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-02 18:22:42
 * @FilePath: /pokeme/tests/unit/simpleTransporter.ts
 * @Description: 
 */

import { ITransporter } from "@/service/transporter";

export class SimpleTransporter implements ITransporter {
    public async send(data: any): Promise<any> {
        
    }
}