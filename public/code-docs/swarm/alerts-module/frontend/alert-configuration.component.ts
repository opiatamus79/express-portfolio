import { Component, EventEmitter,OnInit,Output, Input, ViewChild, HostListener } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { SwalComponent } from '@toverux/ngx-sweetalert2';
import swal from 'sweetalert2';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CreateAlertComponent} from '../_common/create-alert/create-alert.component';
import { UpdateAlertSettingsComponent} from '../_common/update-alert-settings/update-alert-settings.component'
import { AlertNotificationComponent} from '../_common/alert-notification/alert-notification.component'
import {AlertsService} from '../_services/alerts/alerts.service';
import { UsersService } from '../_services/users/users.service';
import { Alert } from '../_models/alert/Alert';
import { Notification } from '../_models/notification/Notification';
import { User }  from '../_models/user/User'
import { AlertTypes } from '../_models/alert-types/AlertTypes';
import {Observable} from 'rxjs/Observable';

//import { ZoneService } from '../_services/zones/zone.service';
//import { Hub } from '../_models/hub/Hub'
//import { Zone } from '../_models/zone/Zone'
declare var $: any;

@Component({
  selector: 'app-alert-configuration',
  templateUrl: './alert-configuration.component.html',
  styleUrls: ['./alert-configuration.component.css']
})
export class AlertConfigurationComponent implements OnInit {
  @Output()
  alertChange: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  editAlertModalClosed = new EventEmitter();
  alertNotificationModalClosed = new EventEmitter();
  public alerts: ReadonlyArray<Alert>;
  public users: ReadonlyArray<User>;
  public bsModalRef: BsModalRef;
  public viewingAlert: Boolean;
  public alertTypes: any;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  filterType: number = -1;
  notification: any;

  public paginationMaxSize = 1;
  public paginationPageLimit = 12;
  public paginationCurrentPage = 0;
  public paginationTotalAlerts = 0;

  constructor( private modalService: BsModalService, private fb: FormBuilder,
     private AlertsService: AlertsService, private UsersService: UsersService) {
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }

  ngOnInit() {
    this.getAlerts();
    this.getUsers();
    //this.getUserGroups();
  }

  onDateChange(newDate: Date) {
    console.log(newDate);
  }

  ngAfterViewInit(){
    this.getAlertTypes();
  //$('.chosen-select').chosen({width: "100%"});

  }
  getAlertTypes(){
    this.AlertsService.indexTypes().subscribe( ({data}) =>{
      console.log(data);
      this.alertTypes = data;
    })
  }
  getAlerts(){
    console.log('here is alert filter type', this.filterType);
    var limit = this.paginationPageLimit;
    var skip = this.paginationCurrentPage == 0 ? 0 : ((this.paginationCurrentPage -1) * limit);

    this.AlertsService.indexWithProtocols(skip, limit, this.filterType).subscribe(
      (data : any) => {
        console.log(data);
        this.alerts = data.data;
        var pagination = data.metadata.pagination;
        this.paginationTotalAlerts = pagination.total
      }
    )
  }
  getUsers(){
    this.UsersService.index().subscribe(
      ({data}) =>{
        this.users = data;
      }
    )
  }

  //this.notification = data;
  /*getNotification(alert: any) {
    this.AlertsService.indexNotification(alert.id)
         .subscribe(
          ({data}) =>{
            this.notification = data;
            return this.notification;
          }

        );
  }*/


  deleteAlert(id: number){
    this.swalWarn().then(result =>{
      this.AlertsService.delete(id).subscribe(
        ({data}) => {
          console.log(data);
          this.swalSuccess().then(result =>{
            this.getAlerts();
            this.ngOnInit();
          })

        }
      )
    })
  }
  pageChanged(event: any) {//may need to make a different function for zone, hub, and node.
    this.paginationCurrentPage = event.page;
    this.getAlerts();

  }
  openCreateAlertModal() {
    this.bsModalRef = this.modalService.show(CreateAlertComponent, Object.assign({}, { class: 'gray inmodal animated slideDown' }));
    this.bsModalRef.content.closeBtnName = 'Close';
    this.bsModalRef.content.createAlertModalClosed.subscribe((result) => {
        if(result)
          this.ngOnInit()
      }
      );
  }
  openNotificationModal(alert){
    console.log('Opening Edit notification  modal')
    this.AlertsService.indexNotification(alert.id)
         .subscribe(
          ({data}) =>{
            this.notification = data;
            console.log(this.notification);
            const initialState = { alert: alert, notification: this.notification};
            this.bsModalRef = this.modalService.show(AlertNotificationComponent ,Object.assign({initialState}, { class: 'gray inmodal animated slideDown'}));
            this.bsModalRef.content.setAlertNotificationForm();
            this.bsModalRef.content.alertNotificationModalClosed.subscribe((result)=>{
                if(result)
                  this.ngOnInit()
              }
            )
          });
  }

  userName(userIndex: any){
    if(this.users){
      for(let user of this.users){
      if(user.id == userIndex)
        return user.firstname + " " + user.lastname;
      }
    }
  }



  swalWarn(){
    return swal({
      title: `Removing Alert`,
      text: `Are you sure you wish to remove the alert?`,
      type: 'warning',
      showConfirmButton: true
    })
  }
  swalSuccess(){
    return swal({
      title: `Removed Alert`,
      text: `Alert has been removed.`,
      type: 'success'
    })
  }

  openEditAlertModal(alert) {
    console.log('Opening Update alert modal')
    const initialState = { alert: alert, users: this.users, createProtocol: false};
    this.bsModalRef = this.modalService.show(UpdateAlertSettingsComponent ,Object.assign({initialState}, { class: 'gray inmodal animated slideDown'}));
    this.bsModalRef.content.setEditAlertForm();
    this.bsModalRef.content.editAlertModalClosed.subscribe((result) => {
        if(result)
          this.ngOnInit()
      }
    )
  }

}
