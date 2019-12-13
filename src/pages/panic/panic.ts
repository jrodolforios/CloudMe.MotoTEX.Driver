import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { EmergenciaSummary, TaxistaSummary } from '../../core/api/to_de_taxi/models';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { TaxistaService } from '../../core/api/to_de_taxi/services';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';

/**
 * Generated class for the PanicPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-panic',
  templateUrl: 'panic.html',
})
export class PanicPage implements OnInit {
  public emergencia: EmergenciaSummary;
  public taxista: TaxistaSummary;
  public nomeTaxista: string = '';
  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    private serviceProvider: AppServiceProvider,
    private taxistaService: TaxistaService,
    private callNumber: CallNumber,
    private launchNavigator: LaunchNavigator,) {
  }

  async ngOnInit() {
    this.emergencia = this.serviceProvider.emergenciaRecebida;
    this.serviceProvider.emergenciaRecebida = undefined;

    await this.taxistaService.ApiV1TaxistaByIdGet(this.emergencia.idTaxista).toPromise()
      .then(x => {
        if (x.success)
          this.taxista = x.data;
          this.nomeTaxista = x.data.usuario.nome;
      })

      
  }

  callPolice(){
    this.serviceProvider.endNotification();
    this.callNumber.callNumber("190", true);
  }

  callTaxist(){
    this.serviceProvider.endNotification();
    this.callNumber.callNumber(this.taxista.usuario.telefone.replace(/[^0-9]+/g, ''), true);
  }

  callNavigate(){
    this.serviceProvider.endNotification();
    var origin: any = { lat: parseFloat(this.emergencia.latitude), lng: parseFloat(this.emergencia.longitude) }

    this.launchNavigator.navigate([origin.lat, origin.lng], {
      app: this.launchNavigator.APP.GOOGLE_MAPS
    });
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad PanicPage');
  }

  async dismiss() {
    this.viewCtrl.dismiss();
  }

}
