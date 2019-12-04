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
import { HttpClientModule } from '@angular/common/http';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AgmDirectionModule } from 'agm-direction';
import { AppServiceProvider } from '../providers/app-service/app-service';
import { ApiModule } from '../core/api/to_de_taxi/api.module';
import { Vibration } from '@ionic-native/vibration/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { SignalRserviceServiceProvider } from '../providers/signal-rservice-service/signal-rservice-service';
import { CatalogosService } from '../providers/Catalogos/catalogos.service';
import { CatalogoSolicitacaoCorrida } from '../providers/Catalogos/catalogo-solicitacao-corrida.service';
import { CatalogoCorrida } from '../providers/Catalogos/catalogo-corrida.service';
import { IonicRatingModule } from 'ionic-rating';

const toDeTaxiAPIBaseURL = 'https://api.todetaxi.com.br';

var config = {
  backButtonText: '',
  backButtonIcon: 'md-arrow-back',
  pageTransition: 'md',
  mode:'md',
  //locationStrategy: 'path'
};

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    ApiModule.forRoot({rootUrl: toDeTaxiAPIBaseURL}),
    BrowserModule,
    IonicRatingModule,
    IonicModule.forRoot(MyApp,config),
    HttpClientModule,
    OAuthModule.forRoot({
			resourceServer: {
				allowedUrls: ['https://api.todetaxi.com.br'],
				sendAccessToken: true
			}
		}),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAP_Xy-1QSclKYAvxSmAZO2BuFAWWAlOZQ',
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
    InAppBrowser,
    Vibration,
    CatalogosService,
    OAuthService,
    NativeAudio,
    global,
    CatalogoCorrida,
    CatalogoSolicitacaoCorrida,
    CallNumber,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AppServiceProvider,
    SignalRserviceServiceProvider,
  ]
})
export class AppModule {}
