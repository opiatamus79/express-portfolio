import { Injectable, Output, EventEmitter} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import decode from 'jwt-decode';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl: string = environment.serverUrl;

  @Output() loginEndModalOpen :EventEmitter<boolean> = new EventEmitter();

  constructor(private http: HttpClient) {}


  login(email: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/login`;

    return this.http.post<any>(url, {email: email, password: password})
      .pipe(
        map(result => {
          var tkn = result.data.token;
          let tokenPayload = decode(tkn);

          localStorage.setItem('access_token', tkn);
          return {signedIn: true, token: tokenPayload};
        })
      );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');

    if(!token){
      return false;
    }

    let tokenPayload = decode(token, {complete: true});
    let dateNow = new Date();
    let isExpired = false;

    if(tokenPayload.exp < dateNow.getTime()){
      isExpired = true;
    }
    return isExpired;
  }

  openLoginModal(){
    this.loginEndModalOpen.emit(true);
  }

  refreshToken() : Observable<boolean>{
    return this.http.post<any>(`${this.baseUrl}/login/refresh`,{})
      .pipe(
        map( result => {
          localStorage.removeItem('access_token');
          localStorage.setItem('access_token', result.token)
          return true;
        })
      )

  }
}
