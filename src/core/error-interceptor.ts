import { HttpRequest, HttpInterceptor, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Notification } from '../core/api/to_de_taxi/models';
import { App } from 'ionic-angular';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

	constructor(private app: App, ) { }

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req).pipe
			(
				tap(evt => {
					if (evt instanceof HttpResponse) {
						if (evt.body && evt.body.notifications) {
							evt.body.notifications.forEach(notif => {
								const apiNotif = notif as Notification;

								if (apiNotif.message.indexOf("401") > -1)
									this.app.getRootNav().setRoot('Login');
							});
						}
					}
				}),
				catchError((err: any) => {
					if (err instanceof HttpErrorResponse) {
						// this.toastSrv.danger(err.message, err.statusText,
						// {
						// 	position: NbGlobalPhysicalPosition.TOP_RIGHT,
						// 	destroyByClick: true,
						// 	duration: 0,
						// 	preventDuplicates: true
						// });
					}
					return of(err);
				})
			);
	}
}
