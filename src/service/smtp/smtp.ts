/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-02-02 17:04:30
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-02 18:30:34
 * @FilePath: /pokeme/src/service/smtp/smtp.ts
 * @Description: 
 */

import { createTransport } from 'nodemailer';
import { ITransporter } from "@/service/transporter";
import { ISensitivity } from '@/service/sensitivity';
import { SmtpEndpoint } from '@/model/mailConfig';
import { Identifer } from '@/model/identifer';
import { Account } from "@/model/account";

export class PokeSmtp implements ITransporter {

    private id: Identifer;
    private sensitivity: ISensitivity;
    private endpoint: SmtpEndpoint;

    constructor(id: Identifer, sensitivity: ISensitivity, endpoint: SmtpEndpoint) {
        this.id = id;
        this.sensitivity = sensitivity;
        this.endpoint = endpoint;
    }

    public async send(to:Account, data: any): Promise<any> {
        return new Promise(resolve => {
            let transporter = createTransport({
                pool: true,
                host: this.endpoint.host,
                port: this.endpoint.port,
                secure: this.endpoint.tls,
                auth: {
                    user: this.id.mail,
                    pass: this.sensitivity.password(this.id)
                },
            });
            transporter.sendMail({
                from: `"${this.id.name}" <${this.id.mail}>`,
                to: `${to.mail}`,
                subject: `#${this.id.name}@pokeme#`,
                text: `${data}`,
            }).then((info) => {

                if(info.response.indexOf('Data Ok') > 0) {
                    resolve(true);
                } else {
                    console.error("[PokeSmtp] sended to", to.mail, "'s response:", info.response);
                    resolve(false);
                }

            }).catch((error) => {
                console.error("[PokeSmtp] sending", to.mail, "'s data occured an error.");
                console.error("[PokeSmtp]", error.toString());

                resolve(false);
            }).finally(() => {
                transporter.close();
            });
        });
    }
}