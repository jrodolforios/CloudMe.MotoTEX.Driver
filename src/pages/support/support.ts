import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ContatoService } from 'src/core/api/to_de_taxi/services';
import { AppServiceProvider } from 'src/providers/app-service/app-service';

/**
 * Generated class for the SupportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-support',
  templateUrl: 'support.html',
})
export class SupportPage implements OnInit{
  public form: FormGroup
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private contatoService: ContatoService,
    private serviceProvider: AppServiceProvider,
    private alertCtrl: AlertController) {
  }

  ngOnInit(): void {
    this.form = new FormGroup(
      {
        'assunto': new FormControl('', [Validators.required]),
        'conteudo': new FormControl('', [Validators.required])
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SupportPage');
  }

  enviar(){
    var assunto: string = this.form.get("assunto").value;
    var conteudo: string = this.form.get("conteudo").value; 
    
    this.contatoService.ApiV1ContatoPost({
      assunto: assunto,
      conteudo: conteudo,
      idTaxista: this.serviceProvider.taxistaLogado.id
    }).toPromise().then(async x =>{
      const alert = await this.alertCtrl.create({
        title: 'Contato enviado',
        message: 'Seu contato foi enviado à nossa equipe, em breve nós retornaremos.',
        buttons: [
          {
            text: 'Ok',
            cssClass: 'secondary',
            handler: (blah) => {
              this.navCtrl.push("Home");
            }
          }
          
        ]
      });
      return await alert.present();
    });
  }

}
