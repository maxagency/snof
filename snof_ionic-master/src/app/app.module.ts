import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MyApp } from './app.component';
import { HttpModule } from '@angular/http';

// Service Providers & Cordova
import { LocalDataServiceProvider } from "../providers/local-data-service/local-data-service";
import { RestApiProvider } from "../providers/rest-api/rest-api";
import { DBAdaptorProvider } from "../providers/db-adaptor/db-adaptor";
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions, CaptureVideoOptions } from '@ionic-native/media-capture';
import { UtilsProvider } from '../providers/utils/utils';
import { File } from '@ionic-native/file';
import { Base64 } from '@ionic-native/base64';
import { VideoEditor } from '@ionic-native/video-editor';
import { Network } from '@ionic-native/network';
import { SQLite } from "@ionic-native/sqlite";
import { IonicStorageModule } from '@ionic/storage';
import { Device } from "@ionic-native/device";
import { ImagePicker } from "@ionic-native/image-picker";
import { Camera } from "@ionic-native/camera";

// General Pages
import { TabsRacing } from "../pages/tabs/tabs-racing";
import { TabsAdmin } from "../pages/tabs/tabs-admin";
import { LogoutPage } from "../pages/logout/logout";
import { LoginPage } from "../pages/login/login";
import { DevPage } from "../pages/dev/dev";
import { WelcomeScreenPage } from '../pages/welcome-screen/welcome-screen';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';

// Racing App
import { DashboardPage } from "../pages/dashboard/dashboard";
import { EventsPage } from "../pages/events/events";
import { CreateTrainingSessionPage } from "../pages/create-training-session/create-training-session";
import { TrainingSessionDetail } from "../pages/training-session-detail/training-session-detail";
import { TrainingScreen } from "../pages/training-screen/training-screen";
import { DrillDetail } from "../pages/drill-detail/drill-detail";
import { DrillDetailReference } from "../pages/drill-detail-reference/drill-detail-reference";
import { EditTrainingSession } from "../pages/edit-training-session/edit-training-session";
import { EndSession } from "../pages/end-session/end-session";
import { AddAthlete } from '../pages/add-athlete/add-athlete';
import { MarkAthleteAbsent } from '../pages/mark-athlete-absent/mark-athlete-absent';
import { MediaCaptureScreen } from '../pages/media-capture/media-capture';
import { SelectDrill } from '../pages/select-drill/select-drill';
import { AttachVideo } from '../pages/attach-video/attach-video';
import { SynchronizePage } from '../pages/synchronize/synchronize';

// Web App
import { EventsAdmin } from "../pages/events-admin/events-admin";
import { MembersPage } from "../pages/members/members";
import { Profile } from "../pages/profile/profile";
import { EditProfile } from "../pages/edit-profile/edit-profile";
import { DrillsAdmin } from "../pages/drills-admin/drills-admin";


export const firebaseConfig = {
  apiKey: 'AIzaSyD7A2lCfcUs8OZxmRhPT9k3XyOMOiFp2l4',
  authDomain: 'snowfolio-demo.firebaseapp.com',
  databaseURL: 'https://snowfolio-demo.firebaseio.com',
  storageBucket: 'snowfolio-demo',
  messagingSenderId: '564166285067'
};

@NgModule({
  declarations: [
    MyApp,
    TabsRacing,
    TabsAdmin,
    DashboardPage,
    DevPage,
    EventsAdmin,
    EventsPage,
    Profile,
    MembersPage,
    LogoutPage,
    LoginPage,
    CreateTrainingSessionPage,
    TrainingSessionDetail,
    TrainingScreen,
    DrillsAdmin,
    DrillDetail,
    DrillDetailReference,
    EditTrainingSession,
    EndSession,
    AddAthlete,
    MarkAthleteAbsent,
    MediaCaptureScreen,
    SelectDrill,
    AttachVideo,
    WelcomeScreenPage,
    ForgotPasswordPage,
    SynchronizePage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: '__snofdb2',
         driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsRacing,
    TabsAdmin,
    DevPage,
    DashboardPage,
    EventsAdmin,
    EventsPage,
    Profile,
    MembersPage,
    LogoutPage,
    LoginPage,
    CreateTrainingSessionPage,
    TrainingSessionDetail,
    TrainingScreen,
    DrillsAdmin,
    DrillDetail,
    DrillDetailReference,
    EditTrainingSession,
    EndSession,
    AddAthlete,
    MarkAthleteAbsent,
    MediaCaptureScreen,
    SelectDrill,
    AttachVideo,
    WelcomeScreenPage,
    ForgotPasswordPage,
    SynchronizePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ImagePicker,
    Camera,
    SQLite,
    Device,
    DBAdaptorProvider,
    LocalDataServiceProvider,
    RestApiProvider,
    MediaCapture,
    UtilsProvider,
    File,
    Base64,
    VideoEditor,
    Network
  ]
})
export class AppModule { }