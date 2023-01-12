/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-02 19:36:34
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-12 13:51:54
 * @FilePath: /pokeme/tests/unit/inviter.spec.ts
 * @Description: 
 */

import { JsonRSAWebTokenSigner, JsonRSAWebTokenVerifier } from "@/service/impl/jsonRSAWebToken";
import { RSASigner, RSAVerifier } from "@/service/impl/rsaSigner";
import { RASKeyPair } from "@/unit/rsa";
import { PokeJwtPayload } from  "@/model/jwtPayload"
import { PokeCommand } from '@/model/protocols'
import { createInviteRequest } from './units';

describe('inviter', () => {
    const rsa = RASKeyPair.generate();
    const rsa_2 = RASKeyPair.generate();
    const validRequest = createInviteRequest(
        {
            id: "example@163.com",
            mail: "example@163.com",
            publicKey: rsa.publicKey,
            name: "example"
        },
        new RSASigner(rsa.privateKey),
        new JsonRSAWebTokenSigner(rsa.privateKey)
    );

    it('Create an invite request', () => {
        expect(validRequest.request.publicKey).toEqual(rsa.publicKey);
        expect(validRequest.request.command).toEqual(PokeCommand.INVITER);

        const verifier: RSAVerifier = new RSAVerifier(rsa.publicKey);
        const jwtVerifier: JsonRSAWebTokenVerifier = new JsonRSAWebTokenVerifier(rsa.publicKey);

        expect(verifier.verify(validRequest.request.body, validRequest.request.signature as string)).toBeTruthy();

        const decoded = jwtVerifier.verify(validRequest.request.body) as PokeJwtPayload;
        expect(decoded.id).toEqual("example@163.com");
        expect(decoded.mail).toEqual("example@163.com");
        expect(decoded.publicKey).toEqual(rsa.publicKey);
        expect(decoded.description).toEqual("an example request");
    })

    it('Verify a valid invite request with invalid public key', () => {
        const verifier: RSAVerifier = new RSAVerifier(rsa_2.publicKey);
        expect(verifier.verify(validRequest.request.body, validRequest.request.signature as string)).toBeFalsy();
    })

    it('Jwt.Verify a valid invite request with invalid public key', () => {
        const verifier: RSAVerifier = new RSAVerifier(rsa.publicKey);
        expect(verifier.verify(validRequest.request.body, validRequest.request.signature as string)).toBeTruthy();
        var decoded :any = null
        try {
            // use an invalid public key 
            const jwtVerifier: JsonRSAWebTokenVerifier = new JsonRSAWebTokenVerifier(rsa_2.publicKey);
            decoded = jwtVerifier.verify(validRequest.request.body) as PokeJwtPayload;
        } catch (err: any) {
            ;
        } finally {
            expect(decoded).toBeFalsy();
        }
    })
})
