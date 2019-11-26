import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FaixaDescontoService, FaixaDescontoTaxistaService } from '../../core/api/to_de_taxi/services';
import { FaixaDescontoTaxistaSummary } from '../../core/api/to_de_taxi/models';
import { AppServiceProvider } from '../../providers/app-service/app-service';

/**
 * Generated class for the DiscountOptionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-discount-options',
  templateUrl: 'discount-options.html',
})
export class DiscountOptionsPage {
  public formasPagamento: any[] = [];
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public faixaDescontoService: FaixaDescontoService,
    public faixaDescontoTaxistaService: FaixaDescontoTaxistaService,
    public serviceProvider: AppServiceProvider) {
  }

  async ionViewDidLoad() {
    await this.faixaDescontoService.ApiV1FaixaDescontoGet().toPromise().then(async x => {
      if (x.success)
        x.data.forEach(y => {
          this.formasPagamento.push({
            id: y.id,
            descricao: y.descricao,
            marcado: false
          });
        });
    })

    await this.faixaDescontoTaxistaService.ApiV1FaixaDescontoTaxistaConsultaIdTaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(x => {
      if (x.success)
        x.data.forEach(y => {
          this.formasPagamento.forEach(z => {
            if (z.id == y.idFaixaDesconto) {
              z.marcado = true;
            }
          })
        });
    });
  }

  togglePayment(id: string, value: boolean) {
    this.formasPagamento.forEach(x => {
      if (x.id == id)
        x.marcado = value;
    });
  }

  saveConfig() {
    var faixaDescontoTaxistaParaAdicionar: FaixaDescontoTaxistaSummary;
    this.serviceProvider.faixasDescontoTaxista.length = 0;
    var idTaxista: string = this.serviceProvider.taxistaLogado.id
    this.faixaDescontoTaxistaService.ApiV1FaixaDescontoTaxistaDeletarPorTaxistaByIdDelete(idTaxista).toPromise().then(async x => {
      if (x.success && x.data) {
        this.formasPagamento.forEach(async y => {
          if (y.marcado) {
            faixaDescontoTaxistaParaAdicionar = {
              idFaixaDesconto: y.id,
              idTaxista: idTaxista
            }

            await this.faixaDescontoTaxistaService.ApiV1FaixaDescontoTaxistaPost(faixaDescontoTaxistaParaAdicionar).toPromise().then(async z => {});
          }
        });
        var toast = await this.serviceProvider.presentToast("Formas de pagamento atualizadas.");
        toast.present();
      } else {
        var toast = await this.serviceProvider.presentToast("Não conseguimos atualizar suas formas de pagamento, tente novamente.");
        toast.present();
      }
    });
    this.serviceProvider.faixasDescontoTaxista.length = 0;
    this.faixaDescontoTaxistaService.ApiV1FaixaDescontoTaxistaConsultaIdTaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(x => {
      if (x.success)
        x.data.forEach(y => {
          this.serviceProvider.faixasDescontoTaxista.push({descricao:'', id: y.idFaixaDesconto})
        });
    });
    this.navCtrl.pop();
  }


}
