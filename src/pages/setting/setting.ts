import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';


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
      title: 'Configurações Financeiras',
      buttons: [
        {
          text: 'Formas de pagamento',
          role: 'Driver',
          handler: () => {
            this.navCtrl.push("PaymentChooserPage");
          }
        },{
          text: 'Faixas de desconto',
          handler: () => {
            this.navCtrl.push("DiscountOptionsPage");
          }
        }
      ]
    });
    actionSheet.present();
  }

}