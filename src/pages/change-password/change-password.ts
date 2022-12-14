import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { UsuarioService } from '../../core/api/to_de_taxi/services';
import { CredenciaisUsuario } from '../../core/api/to_de_taxi/models';
import { AppServiceProvider } from '../../providers/app-service/app-service';

/**
 * Generated class for the ChangePasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
})
export class ChangePasswordPage {

  public form: FormGroup

  constructor(private oauthService: OAuthService,
    private usuarioService: UsuarioService,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private serviceProvider: AppServiceProvider) {
    this.form = new FormGroup(
      {
        'senha': new FormControl('', [Validators.required]),
        'novaSenha': new FormControl('', [Validators.required]),
        'repetirNovaSenha': new FormControl('', [Validators.required]),
      })
  }

  checkPasswords() { // here we have the 'passwords' group
    let pass = this.form.get('novaSenha').value;
    let confirmPass = this.form.get('repetirNovaSenha').value;

    var numeric: boolean = false;
    var upperCase: boolean = false;
    var lowerCase: boolean = false;
    var specialChar: boolean = false;

    var invalid: boolean = pass === confirmPass ? false : true

    var i = 0;
    var character = '';
    while (i <= pass.length) {
      character = pass.charAt(i);
      if (character != "")
        if ((character >= '0' && character <= '9')) {
          numeric = true;
        } else {
          if (character == character.toUpperCase()) {
            upperCase = true;
          }
          if (character == character.toLowerCase()) {
            lowerCase = true;
          }
        }
      i++;
    }

    var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    //            ^                                    ^   
    specialChar = format.test(pass);

    invalid = invalid || !lowerCase || !numeric || pass.length < 8

    return invalid;
  }

  async trocarSenha() {
    if (this.checkPasswords()) {
      const alert = await this.alertCtrl.create({
        title: 'Senha digitada tem que ser mais segura :/',
        message: 'A senha deve ser igual nos dois campos e deve contar 8 caracteres e deve conter letras e n??meros',
        buttons: [{
          text: 'Ok',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }]
      });
      return await alert.present();
    } else {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();
      if (this.oauthService.hasValidIdToken() || this.oauthService.hasValidAccessToken()) {

        this.oauthService.loadUserProfile().then(async x => {
          if (x["sub"]) {
            var id: string = x["sub"];
            var login: string = ''

            await this.usuarioService.ApiV1UsuarioByIdGet(id).toPromise().then(x =>{
              if(x.success)
                login = x.data.credenciais.login;
            })

            var oldPassword: string = this.form.get("senha").value;

            var newPassword: string = this.form.get("novaSenha").value;
            var repeatNewPassword: string = this.form.get("repetirNovaSenha").value;

            var objToSend: CredenciaisUsuario = {
              login: login,
              senhaAnterior: oldPassword,

              senha: newPassword,
              confirmarSenha: repeatNewPassword
            }

            this.usuarioService.ApiV1UsuarioAlteraCredenciaisByIdPost({
              id: id,
              credenciais: objToSend
            }).toPromise().then(async x => {
              if (x.success) {
                const alert = await this.alertCtrl.create({
                  title: 'Senha alterada',
                  message: 'Agora voc?? j?? pode usar a nova senha para logar no MotoTEX',
                  buttons: [{
                    text: 'Ok',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                    }
                  }]
                });
                return await alert.present();
              }
              else {
                const alert = await this.alertCtrl.create({
                  title: 'Aconteceu algo com a altera????o de senha :/',
                  message: 'Veja se voc?? digitou sua antiga senha corretamente e tente novamente.',
                  buttons: [{
                    text: 'Ok',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                    }
                  }]
                });
                return await alert.present();
              }
            });
          } else {
            this.navCtrl.push('Login');
          }
        }).catch(e => {
          this.navCtrl.push('Login');
        });;
      }
    }
  }
}
