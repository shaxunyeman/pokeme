/*
 * @Author: dbliu shaxunyeman@gmail.com
 * @Date: 2023-01-02 18:42:05
 * @LastEditors: dbliu shaxunyeman@gmail.com
 * @LastEditTime: 2023-01-05 23:39:08
 * @FilePath: /i-free-talk/src/model/jwt.ts
 * @Description: 
 */

// standard claims https://datatracker.ietf.org/doc/html/rfc7519#section-4.1
export interface JwtPayload {
    [key: string]: any;
    iss?: string | undefined;
    sub?: string | undefined;
    aud?: string | string[] | undefined;
    exp?: number | undefined;
    nbf?: number | undefined;
    iat?: number | undefined;
    jti?: string | undefined;
}

export interface IJwtSigner {
    sign(payload: string | object): string
}

export interface IJwtVerifier {
    verify(token: string): JwtPayload | string
}
