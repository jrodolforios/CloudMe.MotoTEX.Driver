import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from 'angular-oauth2-oidc';


@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class Setting {

  constructor(public navCtrl: NavController, public navParams: NavParams,public actionSheetCtrl: ActionSheetController, private oauthService: OAuthService) {
  }

  logoutNow(){
    this.navCtrl.push("LogoutPage");
  }

  ionViewCanEnter(){
    var authGuard: AuthGuard = new AuthGuard(this.navCtrl, this.oauthService)

    authGuard.canActivate();
  }


  presentEmergency() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Contatos de emergência',
      buttons: [
        {
          text: 'Motorista',
          role: 'Driver',
          handler: () => {
            console.log('Driver clicked');
          }
        },{
          text: 'Suporte técnico',
          handler: () => {
            console.log('Technical clicked');
          }
        },{
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

}