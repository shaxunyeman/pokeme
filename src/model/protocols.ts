/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-02 12:38:28
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-20 10:20:16
 * @FilePath: /pokeme/src/model/protocols.ts
 * @Description: request and response for inviting
 */

export type InviterBody = {
    id: string
    mail: string
    dateTime: string
    publicKey?: string
    description?: string
}

export type InviteeBody = {
    allow: boolean
    id: string
    mail?: string
    publicKey?: string
    dateTime: string
    description?: string
}

export enum PokeMessageType {
    SINGLE_CHAT = 1,
    GROUP_CHAT,
    UNKOWN
}

export type MessageBody = {
    id: number
    message: string
    passphrase?: string  
    dateTime: string
}

export type ChatMessage = {
    type: PokeMessageType
    from: string
    to: string
    body: MessageBody[]
}

export enum PokeCommand {
    INVITER = 'inviter',
    INVITEE = 'invitee',
    MESSAGE = 'message'
}

export interface PokeRequest {
    command: PokeCommand
    body: any
    publicKey?: string
    signature?: string
}
