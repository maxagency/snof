import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';
import { DatePicker } from '@ionic-native/date-picker';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html'
})

export class EditProfile {

  // nav params
  public user_id: any;


  // objects
  public user: any;
  public type: any;

  constructor(public navCtrl: NavController,
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,
    private navParams: NavParams,
    private datePicker: DatePicker,
    public localDataService: LocalDataServiceProvider) {
      
      this.user_id = navParams.get('user_id');
      if(this.user_id){
        this.type = 'Update';
        // EDIT PROFILE
      }
      else{
        this.type = 'Create';
        // CREATE PROFILE
      }
    /*

    // currently logged in user
    this.localDataService.getCurUser().then((user: any) => {
  

      console.log(user);

    })

    // get user by id
    this.restApi.getObject('user', this.user_id).then((user: any) => {
  
      console.log(user);

      // user.userType = "ATHLETE", or ["COACH" / "HEAD COACH"]
      

    })


    // save user
    this.restApi.updateObject('user', this.user.id, this.user);

    // 




    */

    this.loadData();


  }
  onDateClick(event){
    this.datePicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      date => console.log('Got date: ', date),
      err => console.log('Error occurred while getting date: ', err)
    ); 
  }
  ionViewDidEnter() {

    this.loadData();

  }

  loadData() {


  }


  doSaveProfile() {
    //this.navCtrl.push(DrillDetail);
    //let modal = this.modalCtrl.create(DrillDetail);
    //modal.present();
  }

}