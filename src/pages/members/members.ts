import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';

@Component({
  selector: 'page-members',
  templateUrl: 'members.html'
})

export class MembersPage {


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


  goToMemberDetail() {
    //this.navCtrl.push(DrillDetail);
    //let modal = this.modalCtrl.create(DrillDetail);
    //modal.present();
  }

}