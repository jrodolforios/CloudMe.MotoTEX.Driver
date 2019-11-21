import { Injectable } from '@angular/core';
import { CorridaSummary } from '../../core/api/to_de_taxi/models';
import { CorridaService } from '../../core/api/to_de_taxi/services';
import { ApiCatalog, CatalogApiInterface, ApiResponse, processResponse } from './api-catalog';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';

class CorridaApiInterface implements CatalogApiInterface<CorridaSummary>
{
	private corridaSrv: CorridaService;

	constructor(tarifaSrv: CorridaService)
	{
		this.corridaSrv = tarifaSrv;
	}

	async get(id: string): Promise<CorridaSummary>
	{
		const self = this;

		return new Promise<CorridaSummary>(async (resolve, reject) =>
		{
			await self.corridaSrv.ApiV1CorridaByIdGet(id).toPromise().then(resp =>
			{
				processResponse(resp as ApiResponse<CorridaSummary>, resolve, reject);
			}).catch(reason => reject(reason));
		});
	}

	async getAll(): Promise<CorridaSummary[]>
	{
		const self = this;

		return new Promise<CorridaSummary[]>(async (resolve, reject) =>
		{
			await self.corridaSrv.ApiV1CorridaGet().toPromise().then(resp =>
			{
				processResponse(resp as ApiResponse<CorridaSummary[]>, resolve, reject);
			}).catch(reason => reject(reason));
		});
	}

	async post(item: CorridaSummary): Promise<string>
	{
		const self = this;

		return new Promise<string>(async (resolve, reject) =>
		{
			await self.corridaSrv.ApiV1CorridaPost(item).toPromise().then(resp =>
			{
				processResponse(resp as ApiResponse<string>, resolve, reject);
			}).catch(reason => reject(reason));
		});
	}

	async put(item: CorridaSummary): Promise<boolean>
	{
		const self = this;

		return new Promise<boolean>(async (resolve, reject) =>
		{
			await self.corridaSrv.ApiV1CorridaPut(item).toPromise().then(resp =>
			{
				processResponse(resp as ApiResponse<boolean>, resolve, reject);
			}).catch(reason => reject(reason));
		});
	}

	async delete(id: string): Promise<boolean>
	{
		const self = this;

		return new Promise<boolean>(async (resolve, reject) =>
		{
			await self.corridaSrv.ApiV1CorridaByIdDelete(id).toPromise().then(resp =>
			{
				processResponse(resp as ApiResponse<boolean>, resolve, reject);
			}).catch(reason => reject(reason));
		});
	}
}

@Injectable()
export class CatalogoCorrida extends ApiCatalog<CorridaSummary>
{
	constructor(private oauthService: OAuthService, private tarifaSrv: CorridaService)
	{
		super(oauthService, new CorridaApiInterface(tarifaSrv), 'corrida', 'corrida');
	}
}
