import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { User } from './user';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};
const apiUrl = '/api';
const startRecognitionUrl = '/api/startRecognition';
const newUserURL = '/api/user/new';
const visitorListURL = '/api/visitor/list';
const userLoginURL = '/api/user/login';
const userProfileURL = '/api/user/profile';
const adminLoginURL = '/api/admin/login';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }

  private extractData(res: Response) {
    const body = res;
    return body || { };
  }

  checkApi(): Observable<any> {
    return this.http.get(apiUrl, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError));
  }

  startRecognition(enterCameraUrl: string, exitCameraURL: string): Observable<any> {
    const data = {
      'enterCameraUrl': enterCameraUrl,
      'exitCameraURL': exitCameraURL
    };
    return this.http.post(startRecognitionUrl, data, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  addNewUser(user: User): Observable<any> {
    const uploadData = new FormData();
    uploadData.append('displayName', user.displayName);
    uploadData.append('email', user.email);
    uploadData.append('images', user.images[0]);

    return this.http.post(newUserURL, uploadData, {observe: 'response'});
  }

  getVisitorList(): Observable<any> {
    return this.http.get(visitorListURL).pipe(
      catchError(this.handleError)
    );
  }

  userLogin(email: string, pass: string): Observable<any> {
    const body = { email: email, pass: pass };
    return this.http.post(userLoginURL, body, {observe: 'response'});
  }

  userProfile(email: string, pass: string): Observable<any> {
    const body = { email: email, pass: pass };
    return this.http.post(userProfileURL, body, {observe: 'response'});
  }

  adminLogin(login: string, pass: string): Observable<any> {
    const body = { login: login, pass: pass };
    return this.http.post(adminLoginURL, body, {observe: 'response'});
  }
}
