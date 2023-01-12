/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-07 14:07:09
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-07 18:04:11
 * @FilePath: /pokeme/tests/unit/invitee.spec.ts
 * @Description: 
 */

import { Invitee } from "@/service/invitee";
import { JsonRSAWebTokenSigner, JsonRSAWebTokenVerifier } from "@/service/impl/jsonRSAWebToken";
import { RSASigner, RSAVerifier } from "@/service/impl/rsaSigner";
import { RASKeyPair } from "@/unit/rsa";
import { InviterBody,PokeCommand } from '@/model/protocols'
import { createInviteRequest } from './units';
import { RequestDecoder } from "@/service/decodeRequest";

describe('invitee', () => {
    const invitorRAS = RASKeyPair.generate();
    const inviteeRSA = RASKeyPair.generate();
    const validRequest = createInviteRequest(
        {
            id: "example@163.com",
            mail: "example@163.com",
            publicKey: invitorRAS.publicKey,
            name: "example"
        },
        new RSASigner(invitorRAS.privateKey),
        new JsonRSAWebTokenSigner(invitorRAS.privateKey)
    );

    it('verify a valid invite request with a correct key', () => {
        const invitee: Invitee = new Invitee(
            new RSASigner(inviteeRSA.privateKey),
            new JsonRSAWebTokenSigner(inviteeRSA.privateKey),
            new RSAVerifier(invitorRAS.publicKey),
            new JsonRSAWebTokenVerifier(invitorRAS.publicKey)
        );

        expect(validRequest.request.command).toEqual(PokeCommand.INVITER);
        expect(invitee.verifyInviterBody(
            validRequest.request.body, 
            validRequest.request.signature as string,
            validRequest.hash)).toBeTruthy();
    })

    it('verify a valid invite request with an incorrect key', () => {
        const invitee: Invitee = new Invitee(
            new RSASigner(inviteeRSA.privateKey),
            new JsonRSAWebTokenSigner(inviteeRSA.privateKey),
            new RSAVerifier(inviteeRSA.publicKey),   // with an invalid key
            new JsonRSAWebTokenVerifier(invitorRAS.publicKey)
        );

        expect(invitee.verifyInviterBody(
            validRequest.request.body, 
            validRequest.request.signature as string,
            validRequest.hash)).toBeFalsy();
    })

    it('decode a valid invite body with a correct key', () => {
        const decoder: RequestDecoder = new RequestDecoder(new JsonRSAWebTokenVerifier(invitorRAS.publicKey));
        const body: InviterBody = decoder.decode(validRequest.request);
        expect(body.id).toEqual('example@163.com');
        expect(body.mail).toEqual('example@163.com');
        expect(body.publicKey).toEqual(invitorRAS.publicKey);
    })

    it('decode a valid invite body with an incorrect key', () => {
        var body: any = null;
        try {
            // with an invalid key
            const decoder: RequestDecoder = new RequestDecoder(new JsonRSAWebTokenVerifier(inviteeRSA.publicKey));
            body = decoder.decode(validRequest.request);
        } catch (err: any) {
            ;
        } finally {
            expect(body).toBeFalsy();
        }
    })
})