import { AuthConfig } from 'angular-oauth2-oidc';

// export const authConfig: AuthConfig = {

//     issuer: 'https://auth.todetaxi.com.br',
//     clientId: 'ToDeTaxiAPI_mobile',
//     postLogoutRedirectUri: 'https://passenger.todetaxi.com.br/',
//     redirectUri: "https://passenger.todetaxi.com.br/auth/callback",
//     scope:"todetaxiapi",
//     oidc: false,
// }

//DEV
export const authConfig: AuthConfig = {

    issuer: 'https://auth.todetaxi.com.br',
    clientId: 'ToDeTaxiAPI_mobile',
    postLogoutRedirectUri: 'http://localhost:8100/',
    redirectUri: "http://localhost:8100/#/callback/?",
    scope:"todetaxiapi",
    oidc: false,
}