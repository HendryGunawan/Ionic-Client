import {LoginModel} from "../models/login.model";
import {cfg} from '../app/config';
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Rx";
import { JwtHelperService } from '@auth0/angular-jwt';
import {Events} from "ionic-angular";

@Injectable()
export class AuthService {

  idToken: string;
  idRefreshToken: string;
  refreshSubscription: any;

  constructor(public http:HttpClient, private events: Events){
    this.idToken = localStorage.getItem('access_token');
    this.idRefreshToken = localStorage.getItem('refresh_token');
  }

  login(credentials: LoginModel) {
    return this.http.post(cfg.apiUrl + cfg.user.login, credentials)
      .toPromise()
      .then(data => {
        this.events.publish('user:authorized');
        this.setToken(data.Token, data.refreshToken);
        this.scheduleRefresh();
        return data;
      })
      .catch(e => {
        //this.scheduleRefresh();
        //this.getNewJwt();
        throw e;
      });
  }

  public setToken(idToken: string, idRefreshToken: string)
  {
    this.idToken = idToken;
    this.idRefreshToken = idRefreshToken;
    localStorage.setItem("access_token", idToken);
    localStorage.setItem("refresh_token", idRefreshToken);
  }

  public getNewJwt() {
    // Get a new JWT from Auth0 using the refresh token saved
    // in local storage
    this.http.post(cfg.apiUrl + cfg.user.refresh,{
      token: localStorage.getItem("access_token"),
      refreshToken: localStorage.getItem("refresh_token")
      })
      //.map((res: Response) => res.json())
      .subscribe((res) => {
          this.setToken(res.token, res.refreshToken);
      }, err => {
        if(err.status == 401){
          this.logout();
        }
      });
  }

  public startupTokenRefresh() {
    const helper = new JwtHelperService();

    // If the user is authenticated, use the token stream
    // provided by angular2-jwt and flatMap the token

    if(this.idToken){
      let source = Observable.of(this.idToken).flatMap(
        token => {
          // Get the expiry time to generate
          // a delay in milliseconds
          let now: number = new Date().valueOf();
          let jwtExp: number = helper.decodeToken(token).exp;
          let exp: Date = new Date(0);
          exp.setUTCSeconds(jwtExp);
          let delay: number = exp.valueOf() - now;

          if(delay <= 0) {
            delay=1;
          }
          console.log("delay dari startup sebesar " + delay)
          // Use the delay in a timer to
          // run the refresh at the proper time
          return Observable.timer(delay);
        });

      // Once the delay time from above is
      // reached, get a new JWT and schedule
      // additional refreshes
      source.subscribe(() => {
        this.getNewJwt();
        this.scheduleRefresh();
        console.log("jalan dari startup");
      });

    }else{
      //there is no user logged in
      console.info("there is no user logged in ");
    }
  }

  public scheduleRefresh() {
    // If the user is authenticated, use the token stream
    // provided by angular2-jwt and flatMap the token

    const helper = new JwtHelperService();

    let source = Observable.of(this.idToken).flatMap(
      token => {
        // The delay to generate in this case is the difference
        // between the expiry time and the issued at time
        const decoded = helper.decodeToken(token);
        const expirationDate = helper.getTokenExpirationDate(token);
        const isExpired = helper.isTokenExpired(token);

        console.log(expirationDate);

        let delay = (decoded["exp"] - decoded["iat"])*1000;
        console.log(decoded);

        console.log("will start refresh after :",(delay));
        if(delay-1000<=0)
          delay = 1;
        return Observable.interval(delay);
      });

    this.refreshSubscription = source.subscribe(() => {
      this.getNewJwt();
      console.log("jalan dari schedule");
    });
  }

  logout() {
    // stop function of auto refresh
    this.unscheduleRefresh();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.events.publish('user:login');
  }

  public unscheduleRefresh() {
    // Unsubscribe from the refresh
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

}
