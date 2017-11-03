import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service'; import { CreateTrainingSessionPage } from "../create-training-session/create-training-session";
import { TrainingSessionDetail } from "../training-session-detail/training-session-detail";
import { MediaCaptureScreen } from '../media-capture/media-capture';


@Component({
    selector: 'page-select-drill',
    templateUrl: 'select-drill.html'
})

export class SelectDrill {

    public session_id: string;
    public user_id: string;

    public isReady: boolean;

    public session: any;
    public program: any;
    public drills: any[];


    constructor(private navCtrl: NavController,
        private modalCtrl: ModalController,
        private navParams: NavParams,
        private localDataService: LocalDataServiceProvider) {

        this.session_id = navParams.get("session_id");
        this.drills = [];

    }

    ionViewDidEnter() {

        this.loadData();

    }

    loadData() {

        let that = this;

        that.isReady = false;
        let setScreenData = function(){

            //that.drills = that.session.program.drills;
            that.isReady = true;

        }

        this.localDataService.queryObjects('drill', {}).then((drills: any) => {

            that.drills = drills;
            setScreenData();
        });

        /*
        this.localDataService.getObject('session', this.session_id).then((session: any) => {

            that.session = session;

            that.localDataService.getObject('program', session.program).then((program: any) => {

                if (program) {
                    that.session.program = program;
                }

                setScreenData();

            });


        });
        */

    }

    goToMediaCapture(drill): void {

        this.navCtrl.push(MediaCaptureScreen, {
            drill_id: drill.id,
            session_id: this.session_id
        });

    }


}