import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { TaxistaService } from '../../core/api/to_de_taxi/services';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class Setting {
  public taxistaDisponivel: boolean = false;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController,
    private oauthService: OAuthService,
    private serviceProvider: AppServiceProvider,
    private taxistaService: TaxistaService,
    private iab: InAppBrowser) {
    if (this.serviceProvider && this.serviceProvider.taxistaLogado) {
      this.taxistaService.ApiV1TaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(x => {
        if (x.success) {
          this.serviceProvider.taxistaLogado = x.data;
          this.taxistaDisponivel = this.serviceProvider.taxistaLogado.disponivel;

          if (this.taxistaDisponivel)
            this.serviceProvider.enableBackground();
          else
            this.serviceProvider.disableBackground();
        }
      });
    }
  }

  logoutNow() {
    this.navCtrl.push("LogoutPage");
  }

  ionViewCanEnter() {
    var authGuard: AuthGuard = new AuthGuard(this.navCtrl, this.oauthService, this.serviceProvider);

    authGuard.canActivate();
  }

  showPrivacyPolicy(){
    this.iab.create('https://www.todetaxi.com.br/privacy_policy.html', '_blank', { location: "yes" });
  }

  alterarSenha() {
    this.navCtrl.push("ChangePasswordPage");
  }

  configurarDisponibilidade() {
    this.navCtrl.push("CheckDisponibilityPage");
  }

  presentEmergency() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Configurações Financeiras:',
      buttons: [
        {
          text: 'Formas de pagamento',
          role: 'Driver',
          handler: () => {
            this.navCtrl.push("PaymentChooserPage");
          }
        }, {
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