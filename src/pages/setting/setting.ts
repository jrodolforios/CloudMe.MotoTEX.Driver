import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { TaxistaService } from '../../core/api/to_de_taxi/services';


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
    private taxistaService: TaxistaService) {
    if (this.serviceProvider && this.serviceProvider.taxistaLogado) {
      this.taxistaService.ApiV1TaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(x => {
        if (x.success) {
          this.serviceProvider.taxistaLogado = x.data;
          this.taxistaDisponivel = this.serviceProvider.taxistaLogado.disponivel;
        }
      });
    }
  }

  logoutNow() {
    this.navCtrl.push("LogoutPage");
  }

  ionViewCanEnter() {
    var authGuard: AuthGuard = new AuthGuard(this.navCtrl, this.oauthService)

    authGuard.canActivate();
  }

  alterarSenha() {
    this.navCtrl.push("ChangePasswordPage");
  }

  configurarDisponibilidade() {
    this.navCtrl.push("CheckDisponibilityPage");
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