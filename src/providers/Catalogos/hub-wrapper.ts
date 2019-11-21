import * as signalR from '@aspnet/signalr';
import { HubConnectionState } from '@aspnet/signalr';

export class HubWrapper {
	hubConnection: signalR.HubConnection = null;
	private intentionalTrackingStop = false;

	private _url = '';
	private _accessTokenFactory?(): string | Promise<string>;
	private _reconnection_timeout = 5000;

	constructor(url: string, accessTokenFactory?: () => string | Promise<string>, reconnection_timeout = 5000) {
		try {
			const self = this;
			self._url = url;
			self._accessTokenFactory = accessTokenFactory;
			self._reconnection_timeout = reconnection_timeout;

			self.hubConnection = new signalR.HubConnectionBuilder()
				.withUrl(self._url, { accessTokenFactory: self._accessTokenFactory })
				.build();

			Object.defineProperty(WebSocket, 'OPEN', { value: 1, });

			self.hubConnection.onclose(() => {
				try {
					if (!self.intentionalTrackingStop) {
						self.reconnect();
					}
				} catch (err) {
					console.log(JSON.stringify(err));
				}
			});
		} catch (err) {
			console.log(JSON.stringify(err));
		}
	}

	connect(): Promise<void> {
		try {
			const self = this;
			self.intentionalTrackingStop = false;

			return new Promise(async (resolve, reject) => {
				try {
					if (self.hubConnection.state == HubConnectionState.Disconnected) {
						Object.defineProperty(WebSocket, 'OPEN', { value: 1, });
						await self.hubConnection.start()
							.then(() => {
								resolve();
							})
							.catch(err => {
								reject(err);
								self.reconnect();
							});
					}
				} catch (err) {
					console.log(JSON.stringify(err));
				}
			});
		} catch (err) {
			console.log(JSON.stringify(err));
		}
	}

	private reconnect() {
		try {
			const self = this;
			setTimeout(async () => {
				try {
					await self.connect();
				} catch (err) {
					console.log(JSON.stringify(err));
				}
			},
				self._reconnection_timeout);
		} catch (err) {
			console.log(JSON.stringify(err));
		}
	}

	disconnect(): Promise<void> {
		try {
			const self = this;

			if (self.hubConnection.state == HubConnectionState.Connected) {
				self.intentionalTrackingStop = true;

				return self.hubConnection.stop();
			} else {
				return new Promise(null);
			}
		} catch (err) {
			console.log(JSON.stringify(err));
		}
	}
}
