import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { TaxistaService, VeiculoTaxistaService, VeiculoService } from '../../core/api/to_de_taxi/services';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { VeiculoTaxistaSummary, VeiculoSummary } from 'src/core/api/to_de_taxi/models';

/**
 * Generated class for the CheckDisponibilityPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-check-disponibility',
  templateUrl: 'check-disponibility.html',
})
export class CheckDisponibilityPage {
  public disponibility: boolean = false;
  public veiculosTaxista: VeiculoTaxistaSummary[] = [];
  public veiculos: VeiculoSummary[] = [];
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private taxistaService: TaxistaService,
    private serviceProvider: AppServiceProvider,
    private veiculoTaxistaService: VeiculoTaxistaService,
    private veiculoService: VeiculoService) {

  }

  async ionViewDidLoad() {
    const loading = await this.serviceProvider.loading("Aguarde...");
    loading.present();
    if (this.serviceProvider.taxistaLogado) {
      this.disponibility = this.serviceProvider.taxistaLogado.disponivel;

      this.veiculoTaxistaService.ApiV1VeiculoTaxistaConsultaVeiculosDeTaxistasByIdGet(this.serviceProvider.taxistaLogado.id)
        .toPromise().then(x => {
          if (x.success) {
            this.veiculosTaxista = x.data

            this.veiculosTaxista.forEach(x => {
              this.veiculoService.ApiV1VeiculoByIdGet(x.idVeiculo).toPromise().then(y => {
                if (y.success)
                  this.veiculos.push(y.data);
              });
            });
          }
        })
    }
    loading.dismiss();
  }

  changeDisponibility(value: boolean) {
    this.disponibility = value;
  }

  isVeiculoAtivo(id: string) {
    var resultado: boolean = false;
    
    if (this.veiculosTaxista.length > 0)
      for (var i = 0; i <  this.veiculosTaxista.length; i++) {
        if (this.veiculosTaxista[i].idVeiculo == id && this.veiculosTaxista[i].ativo)
          resultado = true;
      }

    return resultado;
  }

  changeAtivo(id: string) {
    this.veiculosTaxista.forEach(x => {
      if (x.idVeiculo == id)
        x.ativo = true;
      else
        x.ativo = false;
    });
  }

  async saveConfig() {
    const loading = await this.serviceProvider.loading("Aguarde...");
    loading.present();

    if (this.serviceProvider && this.serviceProvider.taxistaLogado) {
      await this.veiculosTaxista.forEach(async x =>{
        await this.veiculoTaxistaService.ApiV1VeiculoTaxistaPut(x).toPromise().then(async y => {
          if(!y.success || !y.data){
            const alert = await this.alertCtrl.create({
              title: 'Você não pode ficar Disopnível',
              message: 'Não conseguimos selecionar o veiculo que você marcou. Tente novamente mais tarde.',
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
      });

      await this.taxistaService.ApiV1TaxistaMarcarTaxistaDisponivelByIdGet({
        id: this.serviceProvider.taxistaLogado.id,
        disponivel: this.disponibility
      }).toPromise().then(async x => {
        if (x.success && x.data) {
          this.serviceProvider.taxistaLogado.disponivel = this.disponibility

          if(this.disponibility){
            this.serviceProvider.enableBackground();
          } else{
            this.serviceProvider.disableBackground();
          }
        } else {
          const alert = await this.alertCtrl.create({
            title: 'Você não pode ficar Disponível',
            message: 'Parece que seu carro está ativo para outro taxista em operação no momento ou você não está autorizado a realizar corridas pelo APP',
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
    }
    loading.dismiss();
    this.navCtrl.push("Home");
  }
}
