import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { MyApp } from './app.component';
import { AgmCoreModule } from '@agm/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { global } from '../providers/global';
import { OAuthService } from '../../auth-oidc/src/oauth-service';
import { OAuthModule } from '../../auth-oidc/src/angular-oauth-oidic.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AgmDirectionModule } from 'agm-direction';
import { AppServiceProvider } from '../providers/app-service/app-service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { ApiModule } from '../core/api/to_de_taxi/api.module';
import { Vibration } from '@ionic-native/vibration/ngx';
import { PowerManagement } from '@ionic-native/power-management/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { SignalRserviceServiceProvider } from '../providers/signal-rservice-service/signal-rservice-service';
import { CatalogosService } from '../providers/Catalogos/catalogos.service';
import { CatalogoSolicitacaoCorrida } from '../providers/Catalogos/catalogo-solicitacao-corrida.service';
import { CatalogoCorrida } from '../providers/Catalogos/catalogo-corrida.service';
import { IonicRatingModule } from 'ionic-rating';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { MessageServiceProvider } from '../providers/message-service/message-service';
import { ErrorInterceptor } from '../core/error-interceptor';
import { SolicitacaoServiceProvider } from '../providers/solicitacao-service/solicitacao-service';
import { Network } from '@ionic-native/network/ngx';
import { Firebase } from '@ionic-native/firebase/ngx';
import {NgxImageCompressService} from 'ngx-image-compress';
const mototextaxistaAPIBaseURL = 'https://api.mototex.cloudme.com.br';

var config = {
  backButtonText: '',
  backButtonIcon: 'md-arrow-back',
  pageTransition: 'md',
  mode:'md',
  navExitApp: false,
};

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    ApiModule.forRoot({rootUrl: mototextaxistaAPIBaseURL}),
    BrowserModule,
    IonicRatingModule,
    IonicModule.forRoot(MyApp,config),
    HttpClientModule,
    OAuthModule.forRoot({
			resourceServer: {
				allowedUrls: ['https://api.mototex.cloudme.com.br'],
				sendAccessToken: true
			}
		}),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCk_Lj8w2juw2elKMV8HgeF28klzu4CgIg',
      libraries: ['places', 'geometry']
    }),
    AgmDirectionModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    MyApp,
    StatusBar,
    LocalNotifications,
    SplashScreen,
    Keyboard,
    BackgroundMode,
    LaunchNavigator,
    AppVersion,
    InAppBrowser,
    Vibration,
    CatalogosService,
    Firebase,
    TextToSpeech,
    OAuthService,
    NgxImageCompressService,
    NativeAudio,
    global,
    PowerManagement,
    AndroidPermissions,
    LocationAccuracy,
    CatalogoCorrida,
    CatalogoSolicitacaoCorrida,
    CallNumber,
    Geolocation,
    {
			provide: HTTP_INTERCEPTORS,
			useClass: ErrorInterceptor,
			multi: true
		},
    // {provide: ErrorHandler, useClass: IonicErrorHandler},
    AppServiceProvider,
    SignalRserviceServiceProvider,
    MessageServiceProvider,
    SolicitacaoServiceProvider,
    Network
  ]
})
export class AppModule {}
