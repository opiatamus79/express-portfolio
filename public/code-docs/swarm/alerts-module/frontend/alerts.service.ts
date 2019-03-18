import {EventEmitter, Injectable, Output} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CollectionResponse, Response} from '../../_models/http/Response';
import {Alert} from '../../_models/alert/Alert';
import {Notification} from '../../_models/notification/Notification';
import { environment } from '../../../environments/environment';
import {Indexable} from '../../_models/http/Indexable';
import {Endpoint} from '../../_models/http/Endpoint';
import {Showable} from '../../_models/http/Showable';
import {Observable} from 'rxjs/Observable';
import {Creatable} from '../../_models/http/Creatable';
import {Model} from '../http/model.service';
import {Updatable} from '../../_models/http/Updatable';




@Injectable({
  providedIn: 'root'
})
export class AlertsService implements Endpoint, Indexable<Alert>, Showable<Alert>, Creatable<Alert>, Updatable<Alert> {
  private model: Model<Alert>;
  private notification_model: Model<Notification>;
  @Output () alertSelected: EventEmitter<Alert> = new EventEmitter<Alert>();
  constructor(private http: HttpClient) {
    this.model = new Model<Alert>(http);
    this.notification_model = new Model<Notification>(http);
  }

  index({url= this.url(), params}: { url?: string; params?: HttpParams } = {}): Observable<CollectionResponse<Alert>> {
    return this.model.index({url, params});
  }
  index_notification({url= this.url(), params}: { url?: string; params?: HttpParams } = {}): Observable<CollectionResponse<Notification>> {
    return this.notification_model.index({url, params});
  }

  indexTypes(){//index alert types
    return this.index({
      url: this.typesUrl(),
      params: new HttpParams()
    });
  }
  indexNotification(alert_id: number): Observable<CollectionResponse<Notification>>{
    return this.index_notification({
      url: this.notificationsUrl() + `/${alert_id}`,
      params: new HttpParams()
    });
  }

  indexPTypes(){//index alert priority types
    return this.index({
      url: this.prioritiesUrl(),
      params: new HttpParams()
    });
  }

  indexWithProtocols(skip, limit, type) {
    if(type > 0){
      return this.index({
        url: this.url() + '/protocols',
        params: new HttpParams()
                .append('type',     type)
                .append('skip',     skip)
                .append('limit',    limit)
      });
    }
    else{
        return this.index({
          url: this.url() + '/protocols',
          params: new HttpParams()
                  .append('skip',     skip)
                  .append('limit',    limit)
        });
    }

  }

  url(): string {
    return `${environment.serverUrl}/alert/settings`;
  }
  protocolsUrl(): string {
    return `${environment.serverUrl}/alert/protocols`;
  }
  notificationsUrl(): string {
    return `${environment.serverUrl}/alert/notifications`;
  }

  typesUrl(): string {
    return `${environment.serverUrl}/alert/types`;
  }
  
  prioritiesUrl(): string {
    return `${environment.serverUrl}/alert/ptypes`;
  }



  postUrl(hubId: number, nodeId: number,sensorId: number, name: string): string {
    if(name == "hub")
      return `${environment.serverUrl}/${name}/${hubId}/alert`;
    else if(name == "node"){
      return `${environment.serverUrl}/${name}/${nodeId}/alert`;
    }
    else if(name == "sensor"){
      return `${environment.serverUrl}/${name}/${sensorId}/alert`;
    }
  }



  show(id: number): Observable<Response<Alert>> {
    return this.model.show(this.showUrl(id));
  }

  private showUrl(id): string {
    return `${this.url()}/${id}`;
  }

  create(body: Alert): Observable<Response<Alert>> {
    //Need to ask Kike if there is a specific reason for having the post routes for alerts 
    //setup to be for node, hub, sensor, and if the id can be switched to have multiple ids for each table, 
    //alert settings_ node,hub,sensor,zone.

    return this.model.create(this.url(), body);

  }
  //Currently using this route to create alerts
  createSingleAsset(body: Alert, hubId: number, nodeId: number, sensorId: number, name: string){
    var url = this.postUrl(hubId, nodeId, sensorId, name);
    return this.model.create(url, body);
  }

  update(id: number, body: Partial<Alert>): Observable<Response<Alert>> {
    console.log(body);
    return this.model.update(this.url(), id, body);
  }

  createProtocol(body: any): Observable<Response<any>> {
    console.log(body);
    return this.model.create(this.protocolsUrl(), body);
  }

  updateProtocol(id: number, body: any): Observable<Response<any>> {
    console.log(body);
    return this.model.update(this.protocolsUrl(), id, body);
  }

  updateNotification(id: number, body: any): Observable<Response<any>> {
    console.log(body);
    return this.model.update(this.notificationsUrl(), id, body);
  }

  delete(id: number): Observable<Response<any>> {
    return this.model.delete(this.url(), id);
  }

  showAlert(toShow: Alert) {
    this.alertSelected.emit(toShow);
  }
}
