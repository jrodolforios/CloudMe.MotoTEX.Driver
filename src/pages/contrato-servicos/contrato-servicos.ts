import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ContratoService } from '../../core/api/to_de_taxi/services';

/**
 * Generated class for the ContratoServicosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-contrato-servicos',
  templateUrl: 'contrato-servicos.html',
})
export class ContratoServicosPage implements OnInit{
  public contrato: string = '';
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public contratoService:ContratoService) {
  }

  async ngOnInit() {
    await this.contratoService.ApiV1ContratoUltimoContratoValidoPost().toPromise().then(x =>{
      if(x.success)
      this.contrato = x.data.conteudo;
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContratoServicosPage');
  }

  backToHome(){
    this.navCtrl.push("Home");
  }

}
