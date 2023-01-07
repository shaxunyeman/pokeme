/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-07 14:09:04
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-07 18:10:41
 * @FilePath: /pokeme/tests/unit/units.ts
 * @Description: 
 */

import { Identifer } from "@/model/identifer";
import { Inviter } from "@/service/inviter";
import { ISigner } from "@/model/signer";
import { IJwtSigner } from '@/model/jwt';
import { PokeRequest } from '@/model/protocols';

export function createInviteRequest(id: Identifer, signer: ISigner, jwtSigner: IJwtSigner): {request: PokeRequest, hash: string} {
    const inviter: Inviter = new Inviter(signer, jwtSigner);
    return inviter.invite(id, "an example request"); 
}
