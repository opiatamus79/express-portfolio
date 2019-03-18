import { Injectable, Output, EventEmitter } 	from '@angular/core';
import { HttpClient, HttpResponse }	from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import * as moment from 'moment'

import { Account, Ticket, TicketComment } from '../_models';


@Injectable({
    providedIn: 'root'
})
export class GuestTicketService {
  baseUrl: string = environment.serverUrl;
  @Output() ticketCreated = new EventEmitter();
  constructor(private http: HttpClient) { }


  createGuestTicket(ticket) {
    return this.http.post(`${this.baseUrl}/api/tickets/guest`, ticket);
  }

  newTicketCreated(){
    this.ticketCreated.emit(true)
  }
  
}
