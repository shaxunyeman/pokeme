/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-13 18:10:39
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-02-03 14:47:45
 * @FilePath: /pokeme/tests/unit/message.spec.ts
 * @Description: 
 */

import { JsonRSAWebTokenSigner, JsonRSAWebTokenVerifier } from "@/service/impl/jsonRSAWebToken";
import { RSASigner, RSAVerifier, RASAsymmetric } from "@/service/impl/rsaSigner";
import { PokeRequestDecoder, PokeRequestValidator } from "@/service/requestTool";
import { Account } from "@/model/account";
import { ChatMessage, PokeMessageType, MessageBody } from '@/model/protocols'
import { RASKeyPair,  } from "@/unit/rsa";
import { Symmetric } from "@/unit/crypto"
import { Factory } from './units';

describe('messages', () => {
    const fromRAS = RASKeyPair.generate();
    const toRSA = RASKeyPair.generate();
    const toAccount: Account = {
        id: 'target@gmail.com',
        mail: 'target@gmail.com',
        name: 'target',
        publicKey: toRSA.publicKey,
    }
    const fatory = new Factory(
        {
            id: "example@163.com",
            mail: "example@163.com",
            publicKey: fromRAS.publicKey,
            name: "example"
        },
        new RSASigner(fromRAS.privateKey),
        new JsonRSAWebTokenSigner(fromRAS.privateKey)
    );

    it('verify a valid message request with a correct key', () => {
        // create a chatmessage
        const message = fatory.newMessage(toAccount, "1", "This is a message comes from pokeme./n这是来自于 pokeme 的测试消息。");

        const requestDecoder: PokeRequestDecoder = new PokeRequestDecoder(new JsonRSAWebTokenVerifier(fromRAS.publicKey));
        const requestValidator: PokeRequestValidator = new PokeRequestValidator(new RSAVerifier(fromRAS.publicKey));

        const isValid = requestValidator.verifyBody(
            message.request.body, 
            message.request.signature as string,
            message.hash);
        expect(isValid).toBeTruthy();

        const chatMsg: ChatMessage = requestDecoder.decode(message.request);
        expect(chatMsg.type).toEqual(PokeMessageType.SINGLE_CHAT);
        expect(chatMsg.from).toEqual('example@163.com');
        expect(chatMsg.to).toEqual('target@gmail.com');
        expect(chatMsg.body.length).toEqual(1);

        const msgBody: MessageBody = chatMsg.body[0];
        expect(msgBody.passphrase).toBeTruthy();
        const asymmetric: RASAsymmetric = new RASAsymmetric();
        const decryptedPassphrase = asymmetric.decipher(toRSA.privateKey, msgBody.passphrase as string);
        const decryptedMsg = Symmetric.decipher(decryptedPassphrase, msgBody.message);
        expect(decryptedMsg).toEqual('This is a message comes from pokeme./n这是来自于 pokeme 的测试消息。')
    })
})