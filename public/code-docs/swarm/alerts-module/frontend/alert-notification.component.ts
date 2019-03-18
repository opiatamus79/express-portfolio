import { Component, EventEmitter, OnInit, Output, Input, ViewChild} from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { trigger, transition, animate, style } from '@angular/animations';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { SwalComponent } from '@toverux/ngx-sweetalert2';
import swal from 'sweetalert2';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { UpdateAlertSettingsComponent} from '../update-alert-settings/update-alert-settings.component'
import { AlertsService} from '../../_services/alerts/alerts.service';
//import { UsersService } from '../../_services/users/users.service';
//import { ZoneService } from '../../_services/zones/zone.service';
//import { HubService  } from '../../_services/hubs/hub.service';
//import { NodeService } from '../../_services/nodes/node.service';
//import { SensorService } from '../../_services/sensors/sensor.service';
//import { User } from '../../_models/user/User';
//import { Zone } from '../../_models/zone/Zone';
//import { Hub } from '../../_models/hub/Hub';
//import { Node } from '../../_models/node/Node';
//import { Sensor } from '../../_models/sensor/Sensor';
//import { Limit } from '../../_models/sensor/Limit';

@Component({
  selector: 'app-alert-notification',
  templateUrl: './alert-notification.component.html',
  styleUrls: ['./alert-notification.component.css']
})
export class AlertNotificationComponent implements OnInit {
  @Output() alertNotificationModalClosed = new EventEmitter();
/*
private usersService: UsersService, private zoneService: ZoneService,
    private hubService: HubService, private nodeService: NodeService, private sensorService: SensorService
*/
  public notificationFG: FormGroup;
  alert: any;
  public notification: any;
  
  constructor(private modalService: BsModalService, public bsModalRef: BsModalRef,
    private alertService: AlertsService,
    private fb: FormBuilder,
    private router: 
      Router) {
        this.notificationFG = this.fb.group({
        status_req: ['', Validators.required],
        feedback_req: ['', Validators.required],
        subject: ['', Validators.required],
        message: ['', Validators.required],
      });
    }

  ngOnInit() {
  	//console.log(this.alert);
  }

  retrieveAlertNotification(){

  }
  setAlertNotificationForm(){
  	console.log(this.notification)
  		/*
      let notification_details: any =   {
      	id: this.notification.id,
      	dateCreated: this.notification.dateCreated,
      	subject: this.notificationFG.value.subject,
      	message: this.notificationFG.value.message,
      	variables: this.notificationFG.value.variables,
      	statusReq: this.notificationFG.value.status_req,
      	feedbackReq: this.notificationFG.value.feedback_req,
      	alertSettingsId: this.notification.alertSettingsId
    }
*/
    this.notificationFG.setValue({
      	subject: this.notification.subject,
      	message: this.notification.message,
      	status_req: this.notification.statusReq,
      	feedback_req: this.notification.feedbackReq
    });


    //this.updateNotification(notification_details);
  }
  updateNotification(){
      let notification_details: any =   {
        id: this.notification.id,
        dateCreated: this.notification.dateCreated,
        subject: this.notificationFG.value.subject,
        message: this.notificationFG.value.message,
        variables: 'test',//this.notification.variables,//this.notificationFG.value.variables,
        statusReq: this.notificationFG.value.status_req,
        feedbackReq: this.notificationFG.value.feedback_req,
        alertSettingsId: this.notification.alertSettingsId
      }


    this.alertService.updateNotification(this.notification.id, notification_details)
      .subscribe(
        data => this.swalSuccess("Updated").then(result =>{ this.closingModal()})
        ,err => this.swalError(err, "Update")
      );
  }
  /*
			"id": 18,
			"dateCreated": "2018-02-26 16:03:28",
	        "subject": "tank level low",
            "message": "High Priority",
            "variables": "id eius laboriosam",
            "statusReq": "eos ducimus",
            "feedbackReq": "dolorem repellendus",
            "alertSettingsId": 3

  */
  swalSuccess(type: string){
    return swal({
      title: `${type}`,
      text: `${type} Notification`,
      type: 'success',
      showConfirmButton: true  
    })
  }

  swalError(err, type: string){
    console.log(err)
    return swal({
      title: `Unable to ${type}`,
      text: `Could not ${type} due to the following reasons:\n` + this.parseEMessages(err),
      type: 'error',
      showConfirmButton: true   
    })
  }
  parseEMessages(data: any){
    return data.error.message ? data.error.message  : "Invalid Response" 
  }
  closingModal(){
   this.bsModalRef.hide();
   this.alertNotificationModalClosed.emit(true);
 }
}
