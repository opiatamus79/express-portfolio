import { Component, OnInit, ViewChild, ChangeDetectorRef, Output, EventEmitter} from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import {NgxSpinnerService} from 'ngx-spinner';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { SwalComponent } from '@toverux/ngx-sweetalert2';
import swal from 'sweetalert2';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { AlertsService} from '../../_services/alerts/alerts.service';
import { UsersService } from '../../_services/users/users.service';
import { AlertTypes } from '../../_models/alert-types/AlertTypes';

import { switchMap } from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-update-alert-settings',
  templateUrl: './update-alert-settings.component.html',
  styleUrls: ['./update-alert-settings.component.css']
})
export class UpdateAlertSettingsComponent implements OnInit {
  @ViewChild('confirm') private confirm: SwalComponent;
  @ViewChild('failure') private failure: SwalComponent;
  @ViewChild('success') private success: SwalComponent;
  @ViewChild('editSuccess') private editSuccessSwal: SwalComponent;
  @Output() editAlertModalClosed = new EventEmitter();
  
  public editAlertFormGroup: FormGroup;
  public errorMessage: string;

  alert: any;
  users: any;
  createProtocol: any;
  relationshipList: any;
  alertChange: any;

  limits: FormArray;
  select_settings = {};
  public selected_history: any = []; //use to save what is the asset to monitor on form.
  asset_index = 0; //selcted asset index
  public alertTypes: any;
  public alertPriorityLevels: any;
  public productType: any;
  public current_user: any;
  rangeInfoTemplate: string = `Inclusive values: Setting both options to YES will signal an alert if a reading is\
  found within the range of ` ;
  rangeInfo: string = '';
  sensorInfo: string = '';

  constructor( public bsModalRef: BsModalRef, private fb: FormBuilder,
     public alertService: AlertsService, public usersService: UsersService, private cd: ChangeDetectorRef) {
    this.editAlertFormGroup = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      priority: ['', Validators.required],
      limits: this.fb.array([ this.limit_settings() ]),
      rate_limit: ['', Validators.required],
      primary_user: ['', Validators.required], //considered target user
      primary_email: ['', Validators.required],
      valid_until: ['', Validators.required],
      enabled: ['', Validators.required],
      sms: ['', Validators.required],
      push: ['', Validators.required],
      email: ['', Validators.required],
      call: ['', Validators.required],
      inApp: ['', Validators.required],
      monitoring_product: ['', Validators.required]
    });
  
   }
   // citizenGroups = [];
   // selCitizenGroups = [];
   selProdOptions = [];
   multiSelSettings = {};
   productMultiSelSettings = {};
   user_emails = [];

  ngOnInit() {
    this.current_user = localStorage.getItem('current_user');
    this.setEmails();
    this.addSensorFormSettings(); 
    //this.alertSetDate = new Date();
    this.select_settings = {
      singleSelection: true,
      idField: 'sensor_id',
      textField: 'name',
      itemsShowLimit: 7,
      allowSearchFilter: true
    };
    this.selected_history = this.alert.limits;
    this.getSelectedAsset();
    console.log(this.relationshipList)
  }
  ngAfterViewInit(){
    //$('.chosen-select').chosen({width: "100%"});
    this.getAlertTypes();
    this.getPriorityLevels();
    
  }
  setEmails(){
    for(let user of this.users)
      this.user_emails.push(user.email); 
  }
  getAlertTypes(){
    this.alertService.indexTypes().subscribe( ({data}) =>{
      this.alertTypes = data;
    })
  }
  getSensorInfo(limitSettingFormIndex: number){
    var i = limitSettingFormIndex;
    return "Description: "+ this.editAlertFormGroup.value.limits[i].name + " - " + this.editAlertFormGroup.value.limits[i].acronym;
  }
  getRangeInfo(){
    const cSAsset = this.asset_index; //currently selected asset
    var LL = this.editAlertFormGroup.value.limits[cSAsset].low_limit;
    var UL = this.editAlertFormGroup.value.limits[cSAsset].high_limit;
    if( LL && UL)
      this.rangeInfo = this.rangeInfoTemplate +  LL.toString() + " and " + UL.toString() + ".";
  } 
  getPriorityLevels(){
    this.alertService.indexPTypes().subscribe( ({data}) =>{
      this.alertPriorityLevels = data;
    })
  }


  addSensorFormSettings(): void {
    this.limits = this.editAlertFormGroup.get('limits') as FormArray;
    
    for(var i = 0; i < this.alert.limits.length - 1; i++)
      this.limits.push(this.limit_settings());
  }

  getSelectedAsset(){
    var index = 0;
    var selectedAsset = [];
    for(let limit of this.selected_history){
      if(limit.currently_monitoring == true ){
        this.asset_index = index;
        selectedAsset = [{sensor_id: limit.sensor_id, name: limit.name}];
      }
      index++;
    }
    return selectedAsset;
  }
  setAssetIndex(sensorId){
    for( let l in this.selected_history){
      if(this.selected_history[l].sensor_id == sensorId)
        this.asset_index = Number(l);
    }
  }
  getModifiedLimits(limits){
    let setLimits = limits.map((val, i, limits) => {
        if(this.asset_index == i){
          val.currently_monitoring = true;
          return val;
        }
        else{
          val.currently_monitoring = false;
            return val;
        }
    });
    console.log(setLimits);
    return setLimits;
  }
  onAssetSelect(item: any) {//will not set asset index if multiselect settings
  // text field is changed to other than name.
    this.setAssetIndex(item.sensor_id)
    var arr = this.selected_history;
    let sHistory = this.selected_history.map((val, i, arr) => {
        if(this.asset_index == i){
          val.currently_monitoring = true;
          return val;
        }
        else{
            val.currently_monitoring = false;
            return val;
        }
    });
    this.selected_history = sHistory;
  }


  limit_settings(): FormGroup {//used along with main formbuilder editAlertFormGroup to make up form.
    return this.fb.group({
      sensor_id: ['', Validators.required],
      low_limit: ['', Validators.required],
      high_limit: ['', Validators.required],
      low_inclusive: ['', Validators.required],
      high_inclusive: ['', Validators.required],
      units: ['', Validators.required],
      name: ['', Validators.required],
      acronym: ['', Validators.required],
      currently_monitoring: ['', Validators.required]
    });
  }


  onDateChange(newDate: Date) {
    //console.log(newDate);
  }
  getDateValues(startDate: string, endDate: string){
    var sD = new Date(startDate);
    var eD = new Date(endDate);
    return [sD, eD];
  }
  setEditAlertForm(){
    this.editAlertFormGroup.setValue({
      name: this.alert.name,
      type: this.alert.type,
      priority: this.alert.priority,
      rate_limit: this.alert.rateLimit,
      primary_user: this.alert.target_user,
      primary_email: this.alert.primary_email,
      valid_until: this.getDateValues(this.alert.start_date, this.alert.end_date),
      limits: this.alert.limits,
      enabled: this.alert.enabled, 
      sms: this.alert.sms,
      push: this.alert.push,
      email: this.alert.email,
      call: this.alert.call,
      inApp: this.alert.inapp_notification,
      monitoring_product: this.getSelectedAsset()
    });
    this.getRangeInfo();
  }
  
  get editAlertFormGroupData() { return <FormArray>this.editAlertFormGroup.get('limits'); }

  submitEditedAlert() {
    const formData: any = new FormData(); 


    let alert_details: any = {
      id: this.alert.id,
      name: this.editAlertFormGroup.value.name,
      dateCreated: this.alert.dateCreated,
      type: this.editAlertFormGroup.value.type,
      priority: this.editAlertFormGroup.value.priority,
      limits: this.getModifiedLimits(this.editAlertFormGroup.value.limits),
      lastDateEnabled: this.alert.lastDateEnabled,
      ackMode: this.alert.ackMode,
      ackNotes: this.alert.ackNotes,
      alertProtocolId: this.alert.alertProtocolId,
      archivingAllowed: this.alert.archivingAllowed,
      variable: this.alert.variable,
      displayPath: this.alert.displayPath,
      timestampSource: this.alert.timestampSource,
      rateLimit: this.editAlertFormGroup.value.rate_limit,
      start_date: this.editAlertFormGroup.value.valid_until[0],
      end_date: this.editAlertFormGroup.value.valid_until[1],
      relationship_made: this.alert.relationship_made,
      enabled: this.editAlertFormGroup.value.enabled,
    }

    let protocol_details: any =   {
      id: this.alert.alertProtocolId,
  	  sms: this.editAlertFormGroup.value.sms,
      push: this.editAlertFormGroup.value.push,
      email: this.editAlertFormGroup.value.email,
      call: this.editAlertFormGroup.value.call,
      inapp_notification: this.editAlertFormGroup.value.inApp,
      target_user: Number(this.editAlertFormGroup.value.primary_user),
      primary_email: this.editAlertFormGroup.value.primary_email
    }
    if(this.createProtocol){//this.swalSuccess().then(result =>{ this.confirmUpdate()})
      this.alertService.createProtocol( protocol_details)
         .subscribe(
           protocols => {
            alert_details.alertProtocolId = protocols.data.id;
            var createFields = this.getHubOrNodeId(alert_details.limits);
            this.alertService.createSingleAsset(alert_details,createFields.hubId, createFields.nodeId,createFields.sensorId, createFields.type).subscribe(
             data => this.swalSuccess("Created").then(result =>{ this.confirmUpdate()})
            ,err => this.swalError(err, "Create Alert")
            )    
          ,err => this.swalError(err, "Create Protocol")
        });
    }
    else{
      this.alertService.update(this.alert.id, alert_details)
         .subscribe(
          //data => this.editSuccessSwal.show(),
           data => this.alertService.updateProtocol(this.alert.alertProtocolId, protocol_details).subscribe(
             protocols => this.swalSuccess("Updated").then(result =>{ this.confirmUpdate()})
            ,err => this.swalError(err, "Update")
            )    
          ,err => this.swalError(err, "Update")
        );
    }

  }

    confirmUpdate(){
      this.bsModalRef.hide();
      this.editAlertModalClosed.emit(true);
    }

      swalSuccess(type: string){
        return swal({
          title: `${type}`,
          text: `${type} Alert`,
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

      getTypeName(){
        var type = this.editAlertFormGroup.value.type;
        console.log(this.alertTypes)
        return this.alertTypes[type-1].name.toLowerCase();
      }
      getHubOrNodeId(limits){
        var name = this.getTypeName();
        console.log(name)
        for(var asset of this.relationshipList){
          if(limits[this.asset_index].sensor_id == asset.sensorId)
            return { sensorId: asset.sensorId, hubId: asset.hubId, nodeId: asset.nodeId, type: name};
        }      
      }


  }


