import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormGroup, Validators, FormControl } from '@angular/forms';

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
  constructor(public navCtrl: NavController, public navParams: NavParams) {
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
  }

}
