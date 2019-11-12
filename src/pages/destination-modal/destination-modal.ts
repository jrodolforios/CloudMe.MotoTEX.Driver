import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { global } from '../../providers/global';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { CorridaService, TarifaService, VeiculoTaxistaService, SolicitacaoCorridaService } from '../../core/api/to_de_taxi/services';
import { CorridaSummary } from '../../core/api/to_de_taxi/models';


@IonicPage()
@Component({
  selector: 'page-destination-modal',
  templateUrl: 'destination-modal.html',
})
export class DestinationModal {

  public origem: string = '';
  public destino: string = '';
  public tempo: string = '';
  public distancia: string = '';
  public valor: string = '';

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public global: global,
    public serviceProvider: AppServiceProvider,
    private corridaService: CorridaService,
    private tarifaService: TarifaService,
    private veiculoTaxistaService: VeiculoTaxistaService,
    private solicitacaoCorridaService: SolicitacaoCorridaService) {

    this.origem = this.serviceProvider.textoOrigem;
    this.destino = this.serviceProvider.textoDestino;
    this.tempo = this.serviceProvider.descTempoViagem;
    this.distancia = this.serviceProvider.descDistanciaViagem;
    this.valor = this.serviceProvider.descValorCorrida;
  }

  // Active Accept Trip function
  async AcceptTrip() {
    var idTarifa: string = '';
    var idVeiculo: string = '';
    var statusCorrida: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0;

    this.global.accept = true;

    this.origem = '';
    this.destino = '';
    this.tempo = '';
    this.distancia = '';
    this.valor = '';

    await this.tarifaService.ApiV1TarifaGet().toPromise().then(x =>{
      if(x.success){
        x.data.forEach(y =>{
          idTarifa = y.id;
        });
      }
    });

    await this.veiculoTaxistaService.ApiV1VeiculoTaxistaConsultaVeiculosDeTaxistasByIdGet(this.serviceProvider.taxistaLogado.id).toPromise().then(x =>{
      if(x.success){
        x.data.forEach(y =>{
          if(y.ativo)
            idVeiculo = y.idVeiculo;
        });
      }
    })

    if(this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 1 || this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 3){
      statusCorrida = 3;
    } else if(this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 2){
      statusCorrida = 1;
    }


    var corrida: CorridaSummary = {
      idRotaExecutada: this.serviceProvider.solicitacaoCorridaEmQuestao.idRota,
      idSolicitacao: this.serviceProvider.solicitacaoCorridaEmQuestao.id,
      idTarifa: idTarifa,
      idTaxista: this.serviceProvider.taxistaLogado.id,
      idVeiculo: idVeiculo,
      status: statusCorrida
    }

    this.corridaService.ApiV1CorridaPost(corrida).toPromise().then(x =>{
      if(x.success){
        corrida.id = x.data;
        this.serviceProvider.corridaEmQuestao = corrida;
      }
    });

    this.serviceProvider.solicitacaoCorridaEmQuestao.situacao = 2

    this.solicitacaoCorridaService.ApiV1SolicitacaoCorridaPut(this.serviceProvider.solicitacaoCorridaEmQuestao).toPromise()
    .then(x =>{
      if(!x.success)
        alert(JSON.stringify(x.notifications));
    });
  }

  // close Modal
  dismiss() {
    this.viewCtrl.dismiss();
  }

}