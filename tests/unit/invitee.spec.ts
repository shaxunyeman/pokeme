/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-07 14:07:09
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-13 21:22:27
 * @FilePath: /pokeme/tests/unit/invitee.spec.ts
 * @Description: 
 */

import { Invitee } from "@/service/invitee";
import { JsonRSAWebTokenSigner, JsonRSAWebTokenVerifier } from "@/service/impl/jsonRSAWebToken";
import { RSASigner, RSAVerifier } from "@/service/impl/rsaSigner";
import { RASKeyPair } from "@/unit/rsa";
import { InviterBody,PokeCommand } from '@/model/protocols'
import { Factory } from './units';
import { PokeRequestDecoder, PokeRequestValidator } from "@/service/requestTool";

describe('invitee', () => {
    const invitorRAS = RASKeyPair.generate();
    const inviteeRSA = RASKeyPair.generate();
    const InviterFactory = new Factory(
        {
            id: "example@163.com",
            mail: "example@163.com",
            publicKey: invitorRAS.publicKey,
            name: "example"
        },
        new RSASigner(invitorRAS.privateKey),
        new JsonRSAWebTokenSigner(invitorRAS.privateKey)
    );
    const validRequest = InviterFactory.newInviteRequest();

    it('verify a valid invite request with a correct key', () => {
        const invitee: Invitee = new Invitee(
            new RSASigner(inviteeRSA.privateKey),
            new JsonRSAWebTokenSigner(inviteeRSA.privateKey));

        const pokeRequestValidator: PokeRequestValidator = new PokeRequestValidator(new RSAVerifier(invitorRAS.publicKey));

        expect(validRequest.request.command).toEqual(PokeCommand.INVITER);
        expect(pokeRequestValidator.verifyBody(
            validRequest.request.body, 
            validRequest.request.signature as string,
            validRequest.hash)).toBeTruthy();
    })

    it('verify a valid invite request with an incorrect key', () => {
        const invitee: Invitee = new Invitee(
            new RSASigner(inviteeRSA.privateKey),
            new JsonRSAWebTokenSigner(inviteeRSA.privateKey));
        // with an invalid key
        const pokeRequestValidator: PokeRequestValidator = new PokeRequestValidator(new RSAVerifier(inviteeRSA.publicKey));
        expect(pokeRequestValidator.verifyBody(
            validRequest.request.body, 
            validRequest.request.signature as string,
            validRequest.hash)).toBeFalsy();
    })

    it('decode a valid invite body with a correct key', () => {
        const decoder: PokeRequestDecoder = new PokeRequestDecoder(new JsonRSAWebTokenVerifier(invitorRAS.publicKey));
        const body: InviterBody = decoder.decode(validRequest.request);
        expect(body.id).toEqual('example@163.com');
        expect(body.mail).toEqual('example@163.com');
        expect(body.publicKey).toEqual(invitorRAS.publicKey);
    })

    it('decode a valid invite body with an incorrect key', () => {
        var body: any = null;
        try {
            // with an invalid key
            const decoder: PokeRequestDecoder = new PokeRequestDecoder(new JsonRSAWebTokenVerifier(inviteeRSA.publicKey));
            body = decoder.decode(validRequest.request);
        } catch (err: any) {
            ;
        } finally {
            expect(body).toBeFalsy();
        }
    })
})