import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { global } from '../../providers/global';
import { AppServiceProvider } from '../../providers/app-service/app-service';
import { CorridaService, TarifaService, VeiculoTaxistaService, SolicitacaoCorridaService } from '../../core/api/to_de_taxi/services';
import { CorridaSummary } from '../../core/api/to_de_taxi/models';
import { CatalogosService } from '../../providers/Catalogos/catalogos.service';


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
  public isAgendamento: boolean = false;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public global: global,
    public serviceProvider: AppServiceProvider,
    private corridaService: CorridaService,
    private tarifaService: TarifaService,
    private veiculoTaxistaService: VeiculoTaxistaService,
    private solicitacaoCorridaService: SolicitacaoCorridaService,
    public alertCtrl: AlertController,
    private catalogosService: CatalogosService) {

    this.origem = this.serviceProvider.textoOrigem;
    this.destino = this.serviceProvider.textoDestino;
    this.tempo = this.serviceProvider.descTempoViagem;
    this.distancia = this.serviceProvider.descDistanciaViagem;

    if (this.serviceProvider.solicitacaoCorridaEmQuestao.isInterUrbano)
      this.valor = "Interurbana"
    else
      this.valor = "R$" + this.serviceProvider.descValorCorrida;

    if (this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 1 || this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 3) {
      this.isAgendamento = false;
    } else if (this.serviceProvider.solicitacaoCorridaEmQuestao.tipoAtendimento == 2) {
      this.isAgendamento = true;
    }
  }

  // Active Accept Trip function
  async AcceptTrip() {
    this.global.accept = true;
  }

  // close Modal
  async dismiss() {
    this.viewCtrl.dismiss();
  }

}