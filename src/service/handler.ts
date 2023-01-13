/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-12 14:39:29
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-12 14:42:53
 * @FilePath: /pokeme/src/service/handler.ts
 * @Description: 
 */

import {PokeRequest} from '@/model/protocols'

export interface Handler {
    /**
     * @description: handle invite request
     * @return {*}
     */    

    processInviter(request: PokeRequest): number

    /**
     * @description: handle invitee request
     * @return {*}
     */    
    processInvitee(request: PokeRequest): number
}
