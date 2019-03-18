import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from '../_services';
import { UsersService } from '../_services';
import { LoggerService } from '../_services';
import decode from 'jwt-decode';
import {NgxPermissionsService, NgxRolesService} from 'ngx-permissions';
import {Role} from '../_models/user/Roles';
declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public email: string;
  public password: string;
  public error: string;
  public rememberMe: boolean = false;

  public data = [];
  constructor(private users: UsersService, private auth: AuthService, private logs: LoggerService,
              private router: Router, private rs: NgxRolesService, private ps: NgxPermissionsService) { }

  ngOnInit() {
    if (localStorage.getItem('access_token')) {
      this.auth.logout();
    }
  }

  public submit() {
    // this.loginLoading = true;
    this.auth.login(this.email, this.password)
      .pipe(first())
      .subscribe(
        result => {
          this.users.getUser(result.token.id).subscribe(currUsr => {
            localStorage.setItem('current_user', JSON.stringify(currUsr));

            this.users.loadPermissions()
            const role = JSON.parse(localStorage.getItem('current_user')).data.roleId;
            this.logs.log('Current User', JSON.parse(localStorage.getItem('current_user')));
            this.logs.log('Current Users Role: ', this.users.getUserRole());
            this.logs.log('User role id:', role);
            if ( role >= 2 && role <= 4) { // customer: primary, field analyst, operator, staff member
              this.router.navigate(['customer-dashboard']);
            } else if (role === 1 || role === 5 || role === 6) {// admin: director, super user
              console.log('navigating');
              this.router.navigate(['admin-dashboard']);
            } else { // user
              // this.router.navigate(['users'])
            }

          });

        },
        err => {
          // this.loginLoading = false;
          console.log('there was an error', err);
          try {
            this.error =  err.error.message + ': ' + err.error.errors[0].message;
          } catch (e) { this.error = err.error.message;  }
        }
      );
  }


}
