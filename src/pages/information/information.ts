import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';


@IonicPage()
@Component({
  selector: 'page-information',
  templateUrl: 'information.html',
})
export class Information {

  constructor(public navCtrl: NavController, public navParams: NavParams, private oauthService: OAuthService) {
  }

// back function
  backButtonClick(){
    this.navCtrl.pop();
  }

  ionViewCanEnter(){
    var authGuard: AuthGuard = new AuthGuard(this.navCtrl, this.oauthService)

    authGuard.canActivate();
  }


}