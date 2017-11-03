import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service'; import { CreateTrainingSessionPage } from "../create-training-session/create-training-session";
import { TrainingSessionDetail } from "../training-session-detail/training-session-detail";
import { MediaCaptureScreen } from '../media-capture/media-capture';
import { DrillDetail } from '../drill-detail/drill-detail';
import { TabsRacing } from '../tabs/tabs-racing';
import { TrainingScreen } from '../training-screen/training-screen';
import { MediaCapture } from '@ionic-native/media-capture';


@Component({
    selector: 'page-attach-video',
    templateUrl: 'attach-video.html'
})

export class AttachVideo {

    // Nav Params
    public session_id: string;
    public drill_id: string;
    public video_id: string;

    public session: any;
    public drill: any;

    public session_athletes: any;
    public athletes_completed: any;
    public athletes_notCompleted: any;

    public selectedAthlete: any;

    public completed: any[];
    public notCompleted: any[];
    public evaluateNow: boolean;


    constructor(private navCtrl: NavController,
                private modalCtrl: ModalController,
                private navParams: NavParams,
                private localDataService: LocalDataServiceProvider) {

        this.session_id = navParams.get('session_id');
        this.drill_id = navParams.get('drill_id');
        this.video_id = navParams.get('video_id');

        this.selectedAthlete = null;

    }

    ionViewDidEnter() {

        this.loadData();

    }

    loadData(): void {

        console.log('session_id ' + this.session_id);
        console.log('drill_id ' + this.drill_id);
        console.log('video_id ' + this.video_id);

        this.evaluateNow = false;

        let that = this;

        let setScreenData = function (session) {

            //that.title = session.location.name + ' - ' + session.phase.name;
            //that.programDrills = session.program.drills;

            that.session_athletes = session.session_users.filter(function (session_user) {
                return session_user.user.userType == 'ATHLETE';
            });

            that.athletes_completed = that.session_athletes.filter(function (session_user) {

                for (var i = 0; i < session_user.user_drills.length; i++) {
                    if (session_user.user_drills[i].drill_id == that.drill_id
                        && session_user.user_drills[i].video) {
                        return true;
                    }
                }
                return false;
            });
            that.athletes_notCompleted = that.session_athletes.filter(function (session_user) {

                for (var i = 0; i < session_user.user_drills.length; i++) {
                    if (session_user.user_drills[i].drill_id == that.drill_id
                        && session_user.user_drills[i].video) {
                        return false;
                    }
                }
                return true;
            });

            // count videos
            for (var i = 0; i < that.athletes_completed.length; i++) {
                let numVideos = 0;
                for (var j = 0; j < that.athletes_completed[i].user_drills.length; j++) {
                    if (that.athletes_completed[i].drill_id == that.drill_id
                        && that.athletes_completed[i].video) {
                        numVideos++;
                    }
                }
                that.athletes_completed[i].numVideos = numVideos;
            }
            for (var i = 0; i < that.athletes_notCompleted.length; i++) {
                let numVideos = 0;
                for (var j = 0; j < that.athletes_notCompleted[i].user_drills.length; j++) {
                    if (that.athletes_notCompleted[i].drill_id == that.drill_id
                        && that.athletes_notCompleted[i].video) {
                        numVideos++;
                    }
                }
                that.athletes_notCompleted[i].numVideos = numVideos;
            }

            console.log(that.athletes_completed);
            console.log(that.athletes_notCompleted);

            that.session = session;

        }

        this.localDataService.getObject('session', this.session_id).then((session: any) => {


            this.localDataService.getObject('program', session.program).then((program: any) => {

                session.program = program;

                this.localDataService.getObjects('session_user', session.session_users).then((session_users: any) => {

                    session.session_users = session_users;

                    this.localDataService.getObject('location', session.location).then((location: any) => {

                        session.location = location;

                        setScreenData(session);

                    });

                });

            });


        });
    }

    goToMediaCapture(drillId: string): void {
        this.navCtrl.push(MediaCaptureScreen);
    }

    toggleEvaluateNow(): void {
        this.evaluateNow = !this.evaluateNow;
    }

    toggleSelectedAthlete(athlete: any): void {
        // First check if athlete is same as already selected. If it is the same
        // unselect that athlete. Otherwise change selected athlete to that provided
        console.log(athlete);
        if (this.isSelectedAthlete(athlete)) {
            this.selectedAthlete = null;
            console.log("no selected athlete")
        } else {
            this.selectedAthlete = athlete;
            console.log('changed selected athlete');
        }         
        
    }

    isSelectedAthlete(athlete: any): boolean {
        let that = this;

        console.log(athlete);
        if (this.selectedAthlete == null || this.selectedAthlete == undefined)  {
            // If null (no athlete is selected)
            return false;
        } 

        const athleteFullName = `${athlete.user.firstName} ${athlete.user.lastName}`;
        console.log(athleteFullName);

        console.log(that.selectedAthlete);
     
        const selectedAthleteFullName = `${that.selectedAthlete.user.firstName} ${that.selectedAthlete.user.lastName}`;
        console.log(selectedAthleteFullName);

        return athleteFullName === selectedAthleteFullName; 

       // return this.selectedAthlete = athlete.id;

    }

    attachVideo(): void {

        let that = this;
        // create session_user instance
        let session_user = this.session.session_users.filter(function (session_user) {
            return session_user.id == that.selectedAthlete;
        });
        if (session_user.length > 0) {
            session_user = session_user[0];
        }
        if (!session_user) {
            return;
        }

        // create user_drill instance
        let user_drill = {

            user_id: session_user.user.id,
            drill_id: this.drill_id,
            session_id: this.session_id,
            video: this.video_id

        }


        this.localDataService.setObject('user_drill', user_drill).then((new_user_drill: any) => {

            // add user_drill to session_user
            this.localDataService.getObject('session_user', session_user.id).then((session_user: any) => {

                let foundUserDrill: any = session_user.user_drills.filter(function (user_drill) {
                    return user_drill.id == new_user_drill.id;
                });
                if (foundUserDrill && foundUserDrill.length < 1) {
                    session_user.user_drills.push(new_user_drill);
                }

                this.localDataService.setObject('session_user', session_user).then((res: any) => {
                    if (this.evaluateNow) {
                        this.navCtrl.push(DrillDetail, {
                            session_id: new_user_drill.session_id,
                            session_user_id: session_user.id,
                            user_id: new_user_drill.user_id,
                            drill_id: new_user_drill.drill_id
                        });
                    } else {
                        this.navCtrl.push(TrainingScreen, {
                            session_id: new_user_drill.session_id
                        });
                    }
                })

            });


        });


    }


}