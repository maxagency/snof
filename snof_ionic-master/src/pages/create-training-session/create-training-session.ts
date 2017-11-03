import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { LocalDataServiceProvider } from '../../providers/local-data-service/local-data-service';


@Component({
  selector: 'page-create-training-session',
  templateUrl: 'create-training-session.html'
})

export class CreateTrainingSessionPage {
  public attendeeSearchTerm: string;
  public filteredAttendees: any;
  public locations: any;
  public phases: any;

  public userThumb: string;
  public phase: string;
  public location: string;
  public description: any;
  public attendees: any;
  public sessionDate: any;
  public sessionStartTime: any;
  public sessionEndTime: any;
  public shouldShowSearchCancel: boolean;

  constructor(public navCtrl: NavController,
    private localDataService: LocalDataServiceProvider,
    private toastCtrl: ToastController) {

    this.attendeeSearchTerm = '';
    this.shouldShowSearchCancel = true;
    this.attendees = [];

    this.sessionDate = new Date().toISOString();

    this.refreshFilteredAttendees();

  }

  loadData(): void {

    this.localDataService.queryObjects('location', {}).then(res => {

      this.locations = res;
      this.localDataService.queryObjects('phase', {}).then(res => {
        this.phases = res;
      });
    });


  }

  ionViewDidEnter() {

    this.loadData();

  }

  addAttendee(attendee): void {
    // Make sure attendee not already added
    let attendeeName = `${attendee.firstName} ${attendee.lastName}`;
    for (let i = 0; i < this.attendees.length; i++) {
      let currAttendeeName = `${this.attendees[i].firstName} ${this.attendees[i].lastName}`;
      if (attendeeName === currAttendeeName) {
        return;
      }
    }
    // Then add attendee if not already added
    this.attendees.push(attendee);
  }

  doCreateSession(): void {
    if (!this.isValidTrainingSession()) {
      this.showToast("Invalid Training Session. Complete all required fields");
      return;
    }

    let program = {

      id: 'program-' + Math.random().toString().substr(2, 8),
      isNew: true,  // must include this, since we're setting ID
      phase: this.phase,
      location: this.location,
      description: this.description,
      attendees: this.attendees,
      sessions: []
    }

    let session = {

      id: 'session-' + Math.random().toString().substr(2, 8),
      isNew: true,  // must include this, since we're setting ID
      phase: this.phase,
      location: this.location,
      program: program.id,
      description: this.description,
      start_date: new Date(new Date(this.sessionDate).toLocaleDateString() + ' ' + this.sessionStartTime),
      end_date: new Date(new Date(this.sessionDate).toLocaleDateString() + ' ' + this.sessionEndTime),
      attendees: this.attendees
    }

    program.sessions = [session];

    this.localDataService.setObject('program', program).then((res: any) => {
      this.localDataService.setObject('session', session).then((res: any) => {

        this.showToast("Training Session Created");

        this.navCtrl.pop();

      })
    });

  }

  cancel(): void {
    this.navCtrl.pop();
  }

  refreshFilteredAttendees(): void {
    // copy by value not reference to keep orig data
    let that = this;
    this.localDataService.queryObjects('user', {}).then((users: any) => {
      that.filteredAttendees = users.filter(function (user) {
        let alltext = (user.firstName + ' ' + user.lastName).toLowerCase();
        return alltext.indexOf(that.attendeeSearchTerm.toLowerCase()) !== -1;
      });
      console.log('query: ' + that.attendeeSearchTerm);
      console.log(that.filteredAttendees);
    });

  }

  isValidTrainingSession(): boolean {
    // TODO: move validation to service
    let hasPhase = this.phase !== '' && this.phase !== null;
    let hasLocation = this.location !== '' && this.location !== null;
    let hasDescription = this.description !== '' && this.description !== null;
    let hasAttendees = this.attendees.length > 0;

    return hasPhase && hasLocation && hasDescription && hasAttendees;
  }

  onSearchCancel(ev) {
    //this.attendeeSearchTerm = '';
    //this.refreshFilteredAttendees();
  }

  showToast(message): void {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

  removeAttendee(attendee): void {
    for (let i = 0; i < this.attendees.length; i++) {
      if (this.attendees[i].name === attendee.name) {
        this.attendees.splice(i, 1);
        return;
      }
    }
  }

}