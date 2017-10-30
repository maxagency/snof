import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';


@Component({
    selector: 'page-drill-detail-reference',
    templateUrl: 'drill-detail-reference.html'
})

export class DrillDetailReference {


    // Nav Params
    public drill_id: any;
    public user_drill_id: any;
    //

    public drill: any;
    public user_drill: any;

    public title: string;
    public description: any;
    public objectives: any;
    public terrain: any;
    public variations: any;

    public videoId: any;

    constructor(public navCtrl: NavController, 
        private toastCtrl: ToastController, 
        private imagePicker: ImagePicker, 
        public navParams: NavParams,
        public localDataService: LocalDataServiceProvider, 
        public camera: Camera) {

        this.drill_id = navParams.get("drill_id");
        this.user_drill_id = navParams.get("user_drill_id");


        this.loadData();

    }

    loadData(){

        let that = this;

        let setScreenData = function(){

            if(that.drill){
                that.description = that.drill.description;
                that.objectives = that.drill.objectives;
                that.terrain = that.drill.terrain;
                that.variations = that.drill.variations;
            }

        }

        this.localDataService.getObject('drill', this.drill_id).then((drill: any) => {

            this.drill = drill;

            this.localDataService.getObject('user_drill', this.user_drill_id).then((user_drill: any) => {

                if(user_drill){
                    this.videoId = user_drill.id;
                }
                setScreenData();

            });

        });

    }


}