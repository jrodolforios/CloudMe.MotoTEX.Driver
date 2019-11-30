import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormaPagamentoService, FormaPagamentoTaxistaService } from '../../core/api/to_de_taxi/services';
import { FormaPagamentoSummary, FormaPagamentoTaxistaSummary } from '../../core/api/to_de_taxi/models';
import { AppServiceProvider } from '../../providers/app-service/app-service';

/**
 * Generated class for the PaymentChooserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-payment-chooser',
  templateUrl: 'payment-chooser.html',
})
export class PaymentChooserPage {
  public formasPagamento: any[] = [];
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public formaPagamentoService: FormaPagamentoService,
    public formaPagamentoTaxistaService: FormaPagamentoTaxistaService,
    public serviceProvider: AppServiceProvider) {
  }

  async ionViewDidLoad() {
    const loading = await this.serviceProvider.loading("Aguarde...");
    loading.present();
    await this.formaPagamentoService.ApiV1FormaPagamentoGet().toPromise().then(async x => {
      if (x.success)
        x.data.forEach(y => {
          this.formasPagamento.push({
            id: y.id,
            descricao: y.descricao,
            marcado: false
          });
        });
    })

    await this.formaPagamentoTaxistaService.ApiV1FormaPagamentoTaxistaConsultaIdTaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(x => {
      if (x.success)
        x.data.forEach(y => {
          this.formasPagamento.forEach(z => {
            if (z.id == y.idFormaPagamento) {
              z.marcado = true;
            }
          })
        });
    });
    loading.dismiss();
  }

  getIcon(guid: String) {
    if (guid == 'b77eb22b-de33-458a-8cc8-a962236e0316')
      return 'card';
    else if (guid == '74337e76-c3ee-46dc-84f5-8cdca10ea4d3')
      return 'card';
    else if (guid == '2ad37112-79c3-4767-8b07-a73e8b5ea370')
      return 'cash';
    else
      return 'cash';
  }

  togglePayment(id: string, value: boolean) {
    this.formasPagamento.forEach(x => {
      if (x.id == id)
        x.marcado = value;
    });
  }


  getIconColor(guid: String) {
    if (guid == 'b77eb22b-de33-458a-8cc8-a962236e0316')
      return 'danger';
    else if (guid == '74337e76-c3ee-46dc-84f5-8cdca10ea4d3')
      return 'warning';
    else if (guid == '2ad37112-79c3-4767-8b07-a73e8b5ea370')
      return 'success';
    else
      return 'default';

  }

  async saveConfig() {
    const loading = await this.serviceProvider.loading("Aguarde...");
    loading.present();
    var formaPagamentoTaxistaParaAdicionar: FormaPagamentoTaxistaSummary;
    var idTaxista: string = this.serviceProvider.taxistaLogado.id
    await this.formaPagamentoTaxistaService.ApiV1FormaPagamentoTaxistaDeletarPorTaxistaByIdDelete(idTaxista).toPromise().then(async x => {
      if (x.success && x.data) {
        this.formasPagamento.forEach(async y => {
          if (y.marcado) {
            formaPagamentoTaxistaParaAdicionar = {
              idFormaPagamento: y.id,
              idTaxista: idTaxista
            }

            await this.formaPagamentoTaxistaService.ApiV1FormaPagamentoTaxistaPost(formaPagamentoTaxistaParaAdicionar).toPromise().then(async z => {
              await this.formaPagamentoTaxistaService.ApiV1FormaPagamentoTaxistaConsultaIdTaxistaByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(x => {
                if (x.success){
                  this.serviceProvider.formasPagamentoTaxista.length = 0;
                  x.data.forEach(y => {
                    this.serviceProvider.formasPagamentoTaxista.push({descricao:'', id: y.idFormaPagamento})
                  });
                }
              });
            });
          }
        });
      } else {
        var toast = await this.serviceProvider.presentToast("Não conseguimos atualizar suas formas de pagamento, tente novamente.");
        toast.present();
      }
      var toast = await this.serviceProvider.presentToast("Formas de pagamento atulizadas.");
      toast.present();

    });
    loading.dismiss();
    this.navCtrl.pop();
  }

}
