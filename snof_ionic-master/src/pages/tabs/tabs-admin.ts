import { Component } from '@angular/core';
import { DashboardPage } from "../dashboard/dashboard";
import { EventsAdmin } from "../events-admin/events-admin";
import { MembersPage } from "../members/members";
import { DrillsAdmin } from "../drills-admin/drills-admin";
import { Profile } from "../profile/profile";
import { EditProfile } from "../edit-profile/edit-profile";
import { LogoutPage } from "../logout/logout";
import { LoginPage } from "../login/login";
import { AlertController, NavController } from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';



@Component({
  templateUrl: 'tabs-admin.html'
})

export class TabsAdmin {

  tab1Root = EventsAdmin;
  tab2Root = MembersPage;
  tab3Root = DrillsAdmin;
  tab4Root = Profile;

  private curUser: any;

  constructor(private alertCtrl: AlertController, 
    public localDataService: LocalDataServiceProvider,
  	public navCtrl: NavController) {

    this.loadData();

  }

  loadData(){

    this.localDataService.getCurUser().then((curUser: any) => {

      this.curUser = curUser;

    })

  }

  doConfirmLogout(){

  	let that = this;
  	this.doConfirmAction({
  		actionText: 'log out',
  		actionFn: function(){

		    that.localDataService.logoutUser();
		    that.navCtrl.setRoot(LoginPage);

  		}
  	})
  }

  doConfirmAction(params){

    let confirm = this.alertCtrl.create({
      title: 'Confirm',
      message: 'Are you sure you want to '+params.actionText+'?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: () => {
            console.log('OK clicked');
            params['actionFn']();
          }
        }
      ]
    });
    confirm.present();

  }


}
