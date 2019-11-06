import { AuthConfig } from '../../auth-oidc/src/auth.config';

// export const authConfig: AuthConfig = {

//     issuer: 'https://auth.todetaxi.com.br',
//     clientId: 'ToDeTaxiAPI_mobile',
//     postLogoutRedirectUri: 'https://passenger.todetaxi.com.br/',
//     redirectUri: "https://passenger.todetaxi.com.br/auth/callback",
//      responseType: 'code',
//      scope: 'openid profile email todetaxiapi offline_access',
//      dummyClientSecret: '9740e17e-9867-4477-8285-bb78485bdf2d'
// }

//DEV
export const authConfig: AuthConfig = {

    issuer: 'https://auth.todetaxi.com.br',
    clientId: 'ToDeTaxiAPI_mobile',
    postLogoutRedirectUri: 'http://localhost:8100/',
    redirectUri: "http://localhost:8100/#/callback/?",
    responseType: 'code',
    scope: 'openid profile email todetaxiapi offline_access',
    dummyClientSecret: '9740e17e-9867-4477-8285-bb78485bdf2d',

}
