import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { SolicitacaoCorridaService } from '../../core/api/to_de_taxi/services';

/**
 * Generated class for the EnviaPropostaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-envia-proposta',
  templateUrl: 'envia-proposta.html',
})
export class EnviaPropostaPage {
  public origem: string = '';
  public destino: string = '';
  public tempo: string = '';
  public distancia: string = '';
  public isAgendamento: boolean = false;
  public valorProposta: string = '';

  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public serviceProvider: AppServiceProvider,
    public solicitacaoCorridaService: SolicitacaoCorridaService) {
    this.origem = this.serviceProvider.textoOrigem;
    this.destino = this.serviceProvider.textoDestino;
    this.tempo = this.serviceProvider.descTempoViagem;
    this.distancia = this.serviceProvider.descDistanciaViagem;

    if (this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 1 || this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 3) {
      this.isAgendamento = false;
    } else if (this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 2) {
      this.isAgendamento = true;
    }
  }

  alterarValorProposta(valor: string) {
      this.valorProposta = valor;
  }


  sendProposta() {
    this.serviceProvider.solicitacaoCorridaEmQuestao.valorProposto = +this.valorProposta;

    this.solicitacaoCorridaService.ApiV1SolicitacaoCorridaPut(this.serviceProvider.solicitacaoCorridaEmQuestao).toPromise()
      .then(x => console.log(JSON.stringify(x)));
  }

  async dismiss() {
    this.viewCtrl.dismiss();
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad EnviaPropostaPage');
  }

}
