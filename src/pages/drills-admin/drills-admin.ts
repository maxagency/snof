import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';

@Component({
  selector: 'page-drills-admin',
  templateUrl: 'drills-admin.html'
})

export class DrillsAdmin {


  constructor(public navCtrl: NavController,
    public modalCtrl: ModalController,
    public localDataService: LocalDataServiceProvider) {


  }

  ionViewDidEnter() {

    this.loadData();

  }

  loadData() {

    this.localDataService.queryObjects('user', {}).then(res => {

    });

  }


  goToDrillDetail() {
    //this.navCtrl.push(DrillDetail);
    //let modal = this.modalCtrl.create(DrillDetail);
    //modal.present();
  }

}