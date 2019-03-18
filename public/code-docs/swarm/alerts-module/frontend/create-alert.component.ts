import { Component, EventEmitter, OnInit, Output, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { trigger, transition, animate, style } from '@angular/animations';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { SwalComponent } from '@toverux/ngx-sweetalert2';
import swal from 'sweetalert2';
import {NgxPrettyCheckboxComponent} from 'ngx-pretty-checkbox';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { UpdateAlertSettingsComponent} from '../update-alert-settings/update-alert-settings.component'
import { UsersService } from '../../_services/users/users.service';
import { ZoneService } from '../../_services/zones/zone.service';
import { HubService  } from '../../_services/hubs/hub.service';
import { NodeService } from '../../_services/nodes/node.service';
import { SensorService } from '../../_services/sensors/sensor.service';
import { CBPagTablesService } from '../../_services/cb-pag-tables.service'
import { User } from '../../_models/user/User';
import { Zone } from '../../_models/zone/Zone';
import { Hub } from '../../_models/hub/Hub';
import { Node } from '../../_models/node/Node';
import { Sensor } from '../../_models/sensor/Sensor';
import { Limit } from '../../_models/sensor/Limit';
declare var $: any;

@Component({
  selector: 'app-create-alert',
  animations: [
    trigger('slideInOut',[
      transition(':enter',[
        style({transform: 'translateY(-100%)'}),
        animate('200ms ease-in', style({transform: 'translateY(0%)'}))
        ]),
        transition(':leave', [
          animate('200ms ease-in', style({transform: 'translateY(-100%)'}))
          ])
    ]),
    trigger('fadeInOut', [
      transition(':enter',[
        style({opacity: '0'}),
        animate('700ms ease-in', style({opacity: '100'}))
        ]),
        transition(':leave', [
          animate('200ms ease-in', style({opacity: '0'}))
          ])
    ])
  ],
  templateUrl: './create-alert.component.html',
  styleUrls: ['./create-alert.component.css']
})
export class CreateAlertComponent implements OnInit {
  @ViewChild('success') private successSwal: SwalComponent;
  @ViewChild('myCheckbox') myCB: NgxPrettyCheckboxComponent;
  @Output() createAlertModalClosed = new EventEmitter();
  public users: ReadonlyArray<User>;
  //public user_groups: any = [];


  public newAlertFormGroup: FormGroup;
  public errorMessage: string;
  public zones: ReadonlyArray<Zone> = [];
  public hubs: ReadonlyArray<Hub> = [];
  public nodes: ReadonlyArray<Node> = [];
  
  public checkedList : any[]= []; 
  public zonesList:    any[]= [];
  public hubsList:     any[]= [];   
  public nodesList:    any[]= [];
  public ShowZones: boolean = true;
  public ShowHubs: boolean = false;
  public ShowNodes: boolean = false;


  public paginationMaxSize = 1;
  public paginationPageLimit = 6;
  public paginationCurrentPage = 0;
  public paginationTotalZones = 0;
  public paginationTotalHubs  = 0;
  public paginationTotalNodes = 0;

  constructor(private modalService: BsModalService, private usersService: UsersService, private zoneService: ZoneService,
    private hubService: HubService, private nodeService: NodeService, private sensorService: SensorService,
    private PagCheckBox: CBPagTablesService, public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private router: 
      Router) {
        this.newAlertFormGroup = this.fb.group({
        title: ['', Validators.required],
      });
    }



  ngOnInit() {
  }
  ngAfterViewInit(){
    this.getTotalZones(); //will need to be moved to happen after get companies function is called
    this.getUsers();
    $('.chosen-select').chosen({width: "100%"});
    $('#ca_selectCompany').change(function(){
      $("#create_alert_form").fadeIn( "slow" );
    });
  }
  itemsInList(){
    
    if(this.checkedList.length > 0)
      return false;
    else
      return true;
    }
    itemsInNodeList(){
    if(this.ShowNodes && this.checkedList.length > 0)
      return false;
    else
      return true;
    }
  
  getTotalZones(){
    this.zoneService.index().subscribe(
      ({data}) => {
        this.paginationTotalZones = data.length;
        this.loadZones();
      }
    )
  }
  getUsers(){
    this.usersService.index().subscribe(
      ({data}) =>{
        this.users = data;
      }
    )
  }
  // getUserGroups(){
  //     this.usersService.getUserGroups().subscribe(
  //     ({data}) =>{
  //       console.log(data);
  //       this.user_groups = data;
  //     }
  //   )

  // }

  loadZones() {
    var limit = this.paginationPageLimit;
    var skip = this.paginationCurrentPage == 0 ? 0 : ((this.paginationCurrentPage -1) * limit);
    this.zoneService.indexbyCompany(1, skip, limit).subscribe(
        ({data}) => {
            this.zones = data;
            console.log("Showing zones:", this.zones);
        }
    )
  }

  beginLoadingHubs(){
        this.paginationCurrentPage = 0;
        this.zonesList = this.checkedList;
        this.checkedList = []; //clear checked list to begin saving checked items list for hubs.
        this.ShowZones = false;
        this.ShowHubs = true;
        this.ShowNodes = false;
        this.loadHubs();
        //$("#zone-accordion").fadeOut("fast");
        //$("#hub-accordion").fadeIn("slow");
  }
  beginLoadingNodes(){
      this.paginationCurrentPage = 0;
      this.hubsList = this.checkedList;
      this.checkedList = []; //clear checked list to begin saving checked items list for hubs.
      this.ShowZones = false;
      this.ShowHubs = false;
      this.ShowNodes = true;
      this.loadNodes();
      //$("#hub-accordion").fadeOut("fast");
      //$("#node-accordion").fadeIn("slow");
  }
  loadHubs() {
    var limit = this.paginationPageLimit;
    var skip = this.paginationCurrentPage == 0 ? 0 : ((this.paginationCurrentPage -1) * limit);
    this.hubService.indexbyZones(this.zonesList, skip, limit).subscribe(
       (data : any) => {//give data that is returned after retrieving all hubs, with zone ids. 
        /*data.forEach(hubResult => {
          this.hubs = this.hubs.concat(hubResult.data);
        })*/
        var pagination = data.metadata.pagination;
        this.hubs = data.data;
        this.paginationTotalHubs = pagination.total;
      }
    )
  }
  loadNodes() {
    var limit = this.paginationPageLimit;
    var skip = this.paginationCurrentPage == 0 ? 0 : ((this.paginationCurrentPage -1) * limit);
    this.nodeService.indexbyHubs(this.hubsList, skip, limit).subscribe(
        (data : any) => {
        var pagination = data.metadata.pagination;
        this.nodes = data.data;
        this.paginationTotalNodes = pagination.total;
      }
    )
  }

  
  pageChangedZones(event: any) {//may need to make a different function for zone, hub, and node.
    this.paginationCurrentPage = event.page;
    this.loadZones();
  }

  pageChangedHubs(event: any) {//may need to make a different function for zone, hub, and node.
    this.paginationCurrentPage = event.page;
    this.loadHubs();
  }
  pageChangedNodes(event: any) {//may need to make a different function for zone, hub, and node.
    this.paginationCurrentPage = event.page;
    this.loadNodes();
  }
  swalSuccess(type: string, sensorsList: string){
    return swal({
      title: `${type}`,
      text: `${type} Alert Here are list of sensors that will be used for alert: ${sensorsList}`,
      type: 'success',
      showConfirmButton: true  
    })
  }
  confirmNodesSet(){
    var skip = 0;
    var limit = 1000;
    this.nodesList = this.checkedList;
    this.sensorService.indexbyNodes(this.nodesList, skip, limit).subscribe( //be aware we are hard
        (data : any) => {
          console.log(data)
          var showingSensors = ''
          for(let s of data.data)
            showingSensors = " " + showingSensors + "Sensor ID: " + s.id + " - Sensor Name:" + s.name + ", ";
          this.swalSuccess("Please Confirm Selection", showingSensors).then(result =>{
            this.openEditAlertModal();
          })
        })
  }
  resetForm(){
    if(this.ShowNodes){
      this.ShowNodes = false;
      this.ShowHubs = true;
      this.checkedList = this.hubsList;
    }
    else{
      this.ShowZones = true;
      this.ShowHubs = false;
      this.ShowNodes = false;
      this.checkedList = this.zonesList;
    }

  }
  openEditAlertModal(){//COME BACK TO THIS DEF (check *Review)
    var skip = 0;
    var limit = 1000; //Review: be aware here the current route is limiting to only  20.
    this.nodesList = this.checkedList;
    this.sensorService.indexbyNodes(this.nodesList, skip, limit).subscribe( //be aware we are hard
        (data : any) => {
          console.log('Showing Sensors:',data);
          const alert = this.getAlertSchema(data.data);
          console.log(alert);
          var assetIdList = this.generateAssetList(data.data)
          const initialState = { alert: alert, users: this.users, createProtocol: true, relationshipList:assetIdList};
          var currentView = this.bsModalRef;
          this.bsModalRef = this.modalService.show(UpdateAlertSettingsComponent ,Object.assign({initialState}, { class: 'gray inmodal animated slideDown'}));
          this.bsModalRef.content.setEditAlertForm();
          this.bsModalRef.content.editAlertModalClosed.subscribe((result) => {
              if(result){
                this.createAlertModalClosed.emit(true);
                currentView.hide();
                this.ngOnInit();
              }
                
            }
              
          )

      }
    )
  }

  getRelatedIds(sensor){
    var nId = null;
    var hId = null;
    for(let node of this.nodesList){
      if(sensor.nodeId == node.id){
        nId = node.id
        return {nodeId: nId, hubId: node.hubId};
      }     
    }
  }
    closingModal(){
      this.bsModalRef.hide();
      this.createAlertModalClosed.emit(true);
    }
  //[sensorId: , NodeId: , HubId]
  generateAssetList(sensors){//used to provide correct Id to update an alert (used for single asset setup for alerts)
    let assetIdList = sensors.map((sen, i, sensors) => {
        let nodeId: any = null;
        let hubId: any = null;
        var ids = this.getRelatedIds(sen);
        return {sensorId: sen.id, nodeId: ids.nodeId, hubId: ids.hubId}
    });
    return assetIdList;
  }

  generateLimits(sensorList: Sensor[]){//begin preparing to set alert information to load edit alert settings modal.
    let limits: Limit[];
    limits = sensorList.map((val, index, sensorList) => {
      var t_limit = {
        sensor_id: sensorList[index].id,
        acronym: sensorList[index].variable,
        high_inclusive: false,
        low_inclusive: false,
        high_limit: -9999,
        low_limit: -9999,
        name: sensorList[index].name,
        units: sensorList[index].metric, //need to update route to return units, need to also confirm with Andres and Kike that this will be changed.
        currently_monitoring:false
      }
      return t_limit;
    }); 


    return limits;
  }
  getAlertSchema(sensorList: Sensor[]){
    
    const alert_details = {
      name: '*',
      type: 1,
      priority: 1,
      rateLimit: 0,
      primary_email: '',
      target_user: 1,
      target_usergroup: 0,
      validUntil: new Date(),
      lastDateEnabled: new Date(),
      timestampSource: new Date(),
      displayPath: ' ',
      ackMode: ' ',
      ackNotes:' ',
      variable: ' ',
      archivingAllowed: true,
      limits: this.generateLimits(sensorList),
      enabled: false, 
      sms: false,
      push: false,
      email: false,
      call: false,
      inapp_notification: false
    }
    return alert_details;
  }


}
