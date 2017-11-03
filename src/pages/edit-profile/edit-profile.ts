import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ToastController,LoadingController,Loading,AlertController} from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';
import { DatePicker } from '@ionic-native/date-picker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Md5} from 'ts-md5/dist/md5';
import { Device } from '@ionic-native/device';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
  providers: [Md5]
})

export class EditProfile {

  // nav params
  public user_id: any;


  // objects
  public user: any;
  public type: any;
  public dob;
  public signupForm: FormGroup;
  public loading: Loading;
  public deviceId;
  constructor(public navCtrl: NavController,
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,
    private formBuilder: FormBuilder,    
    private navParams: NavParams,
    private datePicker: DatePicker,
    private loadingCtrl: LoadingController,
    private _md5: Md5, 
    private device: Device,
    private alertCtrl: AlertController,    
    public localDataService: LocalDataServiceProvider) {
      this.user_id = navParams.get('user_id');
        if(this.user_id){
          this.type = 'Update';
          // EDIT PROFILE
           this.signupForm = formBuilder.group({
              name: ['', Validators.compose([Validators.maxLength(25),Validators.minLength(6), Validators.required])],
              height: ['', Validators.compose([Validators.maxLength(3),Validators.minLength(1), Validators.required])],
              usertype: ['', Validators.compose([Validators.minLength(1), Validators.required])],
              weight: ['', Validators.compose([Validators.maxLength(3),Validators.minLength(1), Validators.required])],
              yoi: ['', Validators.compose([Validators.maxLength(3),Validators.minLength(1), Validators.required])],
              bio: ['', Validators.compose([Validators.maxLength(255),Validators.minLength(1), Validators.required])],
              certification: ['', Validators.compose([Validators.maxLength(255),Validators.minLength(1), Validators.required])],
              areaexpertise: ['', Validators.compose([Validators.maxLength(255),Validators.minLength(1), Validators.required])],
              equipused: ['', Validators.compose([Validators.maxLength(255),Validators.minLength(1), Validators.required])]          
            });
        }
        else{
          this.type = 'Create';
          // CREATE PROFILE
          this.signupForm = formBuilder.group({
              name: ['', Validators.compose([Validators.maxLength(25),Validators.minLength(4), Validators.required])],
              usertype: ['', Validators.compose([Validators.minLength(1), Validators.required])],
              email: ['', Validators.compose([Validators.maxLength(50), Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$'), Validators.required])],
             
              password:['', Validators.compose([Validators.maxLength(25),Validators.minLength(6), Validators.required])],
                          });
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
  doSaveProfile() {
    //this.navCtrl.push(DrillDetail);
    //let modal = this.modalCtrl.create(DrillDetail);
    //modal.present();
    //confirmpassword:['', Validators.compose([Validators.maxLength(25),Validators.minLength(6), Validators.required])],


  }
  signup(): void { 
   //this.deviceId = Md5.hashStr(this.device.uuid);
   this.deviceId = Md5.hashStr("6e88d6283b13d2");
    if (!this.signupForm.valid) {
      console.log(this.signupForm.value);
      this.showToast('Pls Fill all the required fields');
    } else {
      console.log(this.signupForm.value);
       this.localDataService.createUser(this.signupForm.value.usertype,
       this.signupForm.value.name,
       this.signupForm.value.email,
       this.signupForm.value.password,this.deviceId
       )
        .then((curUser: any) => {
          this.showToast('Login successfully..');
          //this.navCtrl.setRoot(TabsRacing);
        }, error => {
          this.loading.dismiss().then(() => {
            let alert = this.alertCtrl.create({
              message: "Pls try again..",
              buttons: [
                {
                  text: "Ok",
                  role: 'cancel'
                }
              ]
            });
            alert.present();
          });
        });

      this.loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
      });
      this.loading.present();
    }
  }
  onDateClick(event){
    this.datePicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      date => {
          this.dob = date;
      },
      err => console.log('Error occurred while getting date: ', err)
    ); 
  }
  ionViewDidEnter() {

    this.loadData();

  }

  loadData() {


  }

  showToast(message): void {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }
}