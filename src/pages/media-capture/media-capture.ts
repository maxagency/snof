import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular'; import { DrillDetailReference } from "../drill-detail-reference/drill-detail-reference";
import { DrillDetail } from '../drill-detail/drill-detail';
import { AttachVideo } from '../attach-video/attach-video';
import { LocalDataServiceProvider } from "../../providers/local-data-service/local-data-service";
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions, CaptureVideoOptions } from '@ionic-native/media-capture';
import { File } from '@ionic-native/file';
import { Base64 } from '@ionic-native/base64';
import { VideoEditor } from '@ionic-native/video-editor';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import { Platform } from 'ionic-angular';

@Component({
    selector: 'page-media-capture',
    templateUrl: 'media-capture.html'
})

export class MediaCaptureScreen {

    public session_id: string;
    public drill_id: string;


    public localVideoSrc: any;
    public localVideoSrcB: any;
    public localVideoSrcC: any;
    public localVideoSrcD: any;
    public localVideoSrcE: any;
    public localVideoSrcF: any;
    public localVideoSrcG: any;

    public isReady: boolean;
    public session: any;
    public drill: any;

    public title: string;

    constructor(private navCtrl: NavController,
        private platform: Platform,
        private navParams: NavParams,
        private toastCtrl: ToastController,
        private localDataService: LocalDataServiceProvider,
        private mediaCapture: MediaCapture,
        private fileApi: File,
        private base64: Base64,
        private videoEditor: VideoEditor,
        private sanitizer: DomSanitizer ) {

        this.session_id = navParams.get("session_id");
        this.drill_id = navParams.get("drill_id");
        this.loadData();

        this.localVideoSrc = 'http://';

    }


    loadData() {

        let that = this;
        that.isReady = false;

        let setScreenData = function(){

            that.title = that.drill.name;
            that.isReady = true;

            that.doCaptureVideo();

        }

        that.localDataService.getObject('session', that.session_id).then((session: any) => {

            that.session = session;

            that.localDataService.getObject('drill', that.drill_id).then((drill: any) => {

                that.drill = drill;
                setScreenData();

            });
        });

    }

    didSaveVideoFile(video){

       // var video = {
       //     id: videoId,
       //     fileName: fileName,
       //     thumb: null
       // }

       debugger;
        video.isNew = true; // must set, as we already assigned ID
        this.localDataService.setObject('video', video).then((res: any) => {

            this.navCtrl.push(AttachVideo, {
                video_id: video.id,
                session_id: this.session_id,
                drill_id: this.drill_id
            });

        });

    }

    doCaptureVideo(){

        let options: CaptureVideoOptions = { limit: 3};

        let that = this;

        let videoId = 'video-'+Math.round(Math.random()*100000000);

        if(this.platform.is('core') || this.platform.is('mobileweb')){
            that.didSaveVideoFile({
                id: videoId,
                fileName: 'no-cordova-file'
            });
            return;
        }


        that.mediaCapture.captureVideo(options).then((mediaFile: MediaFile[]) => {

            let video: any = mediaFile[0];
            console.log(video);
            /* 
            [
                {
                    "name":"52776127165__2A0133A7-8CB8-4873-96E1-ACC2BE5D83FD.MOV",
                    "localURL":"cdvfile://localhost/temporary/52776127165__2A0133A7-8CB8-4873-96E1-ACC2BE5D83FD.MOV",
                    "type":"video/quicktime",
                    "lastModified":null,
                    "lastModifiedDate":1506068476000,
                    "size":540571,
                    "start":0,
                    "end":0,
                    "fullPath":"/private/var/mobile/Containers/Data/Application/FB50CE69-AF7C-4955-946B-589957CEC374/tmp/52776127165__2A0133A7-8CB8-4873-96E1-ACC2BE5D83FD.MOV"
                }
            ]
            */

            //that.transcodeVideo(video);

            that.saveTmpVideoFileToStorage(video, videoId).then((file: any) => {

                console.log('savedTmpVideoFileToStorage');
                that.getVideoFileFromStorage(videoId).then((file_saved: any) => {

                    console.log(' done getVideoFileFromStorage');
                    console.log(file_saved);

                    video.id = videoId;
                    video.fileName = file_saved.name;
                    video.thumb = null;
                    video.nativeURL = file_saved.nativeURL;

                    // this Works
                    // that.localVideoSrc = that.sanitizer.bypassSecurityTrustResourceUrl(video.nativeURL);
                    //
                    //  <video id="main-video" [src]="localVideoSrc" controls="controls" controls playsinline></video>
                    //
                    that.didSaveVideoFile(video);

/*
                    document.getElementById('main-video').play()
                    
                    that.readFileAsBase64(video.fileName).then((res: string) => {
//
                        that.localVideoSrcB = that.sanitizer.bypassSecurityTrustResourceUrl(res);
                    //    console.log(res);
//
                    });
                    */

                })

            });

        }, (err: CaptureError) => {

            console.log(err);
            that.navCtrl.pop();

        });

    }

    doCaptureImage(){

        let options: CaptureImageOptions = { limit: 3};

        this.mediaCapture.captureImage(options).then((data: MediaFile[]) => {

            console.log(data);
            /*
            [
                {
                    "name":"photo_001.jpg",
                    "localURL":"cdvfile://localhost/temporary/photo_001.jpg",
                    "type":"image/jpeg",
                    "lastModified":null,
                    "lastModifiedDate":1506068556000,
                    "size":1111208,
                    "start":0,
                    "end":0,
                    "fullPath":"/var/mobile/Containers/Data/Application/FB50CE69-AF7C-4955-946B-589957CEC374/tmp/photo_001.jpg"
                }
            ]
            */

        }, (err: CaptureError) => {

            console.log(err);

        });

    }


    readFileAsBase64(fileName){

        return new Promise(resolve => {

            //console.log('file.applicationDirectory: '+this.fileApi.applicationDirectory);
            //console.log('file.applicationStorageDirectory: '+this.fileApi.applicationStorageDirectory);
            //console.log('file.dataDirectory: '+this.fileApi.dataDirectory);
            //console.log('file.cacheDirectory: '+this.fileApi.cacheDirectory);
//
            //console.log('file.tempDirectory: '+this.fileApi.tempDirectory);
            //console.log('file.cacheDirectory: '+this.fileApi.cacheDirectory);
            //console.log('file.syncedDataDirectory: '+this.fileApi.syncedDataDirectory);
            //console.log('file.documentsDirectory: '+this.fileApi.documentsDirectory);

            this.fileApi.readAsDataURL(this.fileApi.dataDirectory, fileName).then((base64: string) => {

                resolve(base64);

            });

        });
    }


    saveTmpVideoFileToStorage(srcFile, videoId){

        console.log('saveTmpVideoFileToStorage');
        return new Promise(resolve => {
            this.fileApi.moveFile(this.fileApi.tempDirectory, srcFile.name, this.fileApi.dataDirectory, videoId+'.MOV').then((res: any) => {

                console.log(res);
                resolve(res);

            });
        });

    }

    getVideoFileFromStorage(videoId){

        return new Promise(resolve => {
            this.fileApi.resolveDirectoryUrl(this.fileApi.dataDirectory).then((directoryEntry: any) => {
                this.fileApi.getFile(directoryEntry, videoId+'.MOV', {}).then((file: any) => {
                    resolve(file);
                });
            });
        });


    }


    transcodeVideo(file){

        var that = this;

        return new Promise(resolve => {
            var VideoEditorOptions = {
                OptimizeForNetworkUse: {
                    NO: 0,
                    YES: 1
                },
                OutputFileType: {
                    M4V: 0,
                    MPEG4: 1,
                    M4A: 2,
                    QUICK_TIME: 3
                }
            };
            var videoFileName = 'video-name-here'; // I suggest a uuid

            this.videoEditor.transcodeVideo(
                {
                    fileUri: file.fullPath,
                    outputFileName: videoFileName,
                    outputFileType: VideoEditorOptions.OutputFileType.MPEG4,
                    optimizeForNetworkUse: VideoEditorOptions.OptimizeForNetworkUse.YES,
                    saveToLibrary: true,
                    maintainAspectRatio: true,
                    width: 640,
                    height: 640,
                    videoBitrate: 1000000, // 1 megabit
                    audioChannels: 2,
                    audioSampleRate: 44100,
                    audioBitrate: 128000, // 128 kilobits
                    progress: function(info) {
                        console.log('transcodeVideo progress callback, info: ' + info);
                    }
                }
            ).then((res: any) => {
                console.log('transcode success..');
                console.log(res);

                //that.localVideoSrcF = that.sanitizer.bypassSecurityTrustResourceUrl(res);
                //that.localVideoSrcG = res;
                //that.snapshotVideo(file, 1);
                resolve(res);

            })

        });

    }

    snapshotVideo(file, atTime:number){

        this.videoEditor.createThumbnail({
            fileUri: file.fullPath,
            outputFileName: 'thumbnail',
            atTime: atTime
        }).then((res: any) => {

            console.log('create thumbnail success..');
            console.log(res);

        });

    }

    saveTmpImageFileToStorage(srcFile, thumbId){

    }


    cancel(): void {

    }

    goToDrillDetail(): void {
        this.navCtrl.push(DrillDetail);
    }

    goToAttachVideo(): void {
        this.navCtrl.push(AttachVideo, {
            media_id: 0
        });
    }

}