import { Component, Renderer } from '@angular/core';
import { IonicPage, NavController, ViewController } from 'ionic-angular';
import $ from "jquery";
import 'intl-tel-input';
import { AuthGuard } from '../../auth/auth.guard';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';
import { AppServiceProvider } from '../../providers/app-service/app-service';
@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class Profile {

  tabs = "Histórico";
  history: Array<any>;
  notification: Array<any>;
  notify: Array<any>;
  headerbg: any;
  darkHeader: any;
  public isDisabled: boolean = true;

  public nome: string = '';
  public email: string = '';
  public telefone: string = '';
  public fotoPerfil: string = 'assets/img/user-img.png';


  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public renderer: Renderer, private oauthService: OAuthService, public serviceProvider: AppServiceProvider) {
    this.history = [{ from: '243 Joanie Pine', to: '8753 Mauricio Walks', date: 'Hoje às 15:30hrs', cash: 'R$ 50,13' }, { from: '243 Joanie Pine', to: '8753 Mauricio Walks', date: 'Hoje às 15h30', cash: 'R$ 50,13' }]

    this.notify = [{ from: '243 Joanie Pine', to: '8753 Mauricio Walks', date: 'Hoje às 15:00hrs' }]
    if (serviceProvider.taxistaLogado && serviceProvider.taxistaLogado.usuario) {
      this.nome = serviceProvider.taxistaLogado.usuario.nome;
      this.email = serviceProvider.taxistaLogado.usuario.email;
      this.telefone = serviceProvider.taxistaLogado.usuario.telefone;
      this.fotoPerfil = atob(serviceProvider.taxistaLogado.foto.dados);
    }
  }


  // remove item of list
  removeItem(item) {
    for (var i = 0; i < this.notify.length; i++) {
      if (this.notify[i] == item) {
        this.notify.splice(i, 1);
      }

    }
  }

  ionViewCanEnter() {
    var authGuard: AuthGuard = new AuthGuard(this.navCtrl, this.oauthService)

    authGuard.canActivate();
  }


  //scroll header function
  ngAfterViewInit() {
    var lengthHeader = document.getElementsByClassName("toolbar-md").length - 1;
    this.headerbg = document.getElementsByClassName("toolbar-md")[lengthHeader];
  }

  scrollingFun(ev) {
    ev.domWrite(() => {
      this.updateHeader(ev);
      //
    });
  }
  updateHeader(ev) {
    if (ev.scrollTop > 0) {
      this.darkHeader = ev.scrollTop / 380;
    }

    this.renderer.setElementStyle(this.headerbg, 'background', 'rgba(158,158,158,' + this.darkHeader + ')');
  }

  //enable input for edit
  changeData() {
    this.isDisabled = !this.isDisabled;
  }

  // intlTelInput for select country id
  ngOnInit(): any {
    let output = $("#output");
    let telInput = $("#phone");

    // telInput.intlTelInput();

  }

}