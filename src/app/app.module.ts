import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';
import { global } from '../providers/global';
import { OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { HttpClientModule } from '@angular/common/http';


var config = {
  backButtonText: '',
  backButtonIcon: 'md-arrow-back',
  pageTransition: 'md',
  mode:'md',
};

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp,config),
    HttpClientModule,
    OAuthModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    MyApp,
    StatusBar,
    SplashScreen,
    Keyboard,
    OAuthService,
    global,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
