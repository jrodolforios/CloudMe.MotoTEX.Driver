import { Injectable } from '@angular/core';
import { SolicitacaoCorridaSummary } from '../../core/api/to_de_taxi/models';
import { SolicitacaoCorridaService } from '../../core/api/to_de_taxi/services';
import { ApiCatalog, CatalogApiInterface, ApiResponse, processResponse } from './api-catalog';
import { OAuthService } from '../../../auth-oidc/src/oauth-service';

class SolicitacaoCorridaApiInterface implements CatalogApiInterface<SolicitacaoCorridaSummary>
{
	private solicitacaoCorridaSrv: SolicitacaoCorridaService;

	constructor(tarifaSrv: SolicitacaoCorridaService)
	{
		this.solicitacaoCorridaSrv = tarifaSrv;
	}

	async get(id: string): Promise<SolicitacaoCorridaSummary>
	{
		const self = this;

		return new Promise<SolicitacaoCorridaSummary>(async (resolve, reject) =>
		{
			await self.solicitacaoCorridaSrv.ApiV1SolicitacaoCorridaByIdGet(id).toPromise().then(resp =>
			{
				processResponse(resp as ApiResponse<SolicitacaoCorridaSummary>, resolve, reject);
			}).catch(reason => reject(reason));
		});
	}

	async getAll(): Promise<SolicitacaoCorridaSummary[]>
	{
		const self = this;

		return new Promise<SolicitacaoCorridaSummary[]>(async (resolve, reject) =>
		{
			await self.solicitacaoCorridaSrv.ApiV1SolicitacaoCorridaGet().toPromise().then(resp =>
			{
				processResponse(resp as ApiResponse<SolicitacaoCorridaSummary[]>, resolve, reject);
			}).catch(reason => reject(reason));
		});
	}

	async post(item: SolicitacaoCorridaSummary): Promise<string>
	{
		const self = this;

		return new Promise<string>(async (resolve, reject) =>
		{
			await self.solicitacaoCorridaSrv.ApiV1SolicitacaoCorridaPost(item).toPromise().then(resp =>
			{
				processResponse(resp as ApiResponse<string>, resolve, reject);
			}).catch(reason => reject(reason));
		});
	}

	async put(item: SolicitacaoCorridaSummary): Promise<boolean>
	{
		const self = this;

		return new Promise<boolean>(async (resolve, reject) =>
		{
			await self.solicitacaoCorridaSrv.ApiV1SolicitacaoCorridaPut(item).toPromise().then(resp =>
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
			await self.solicitacaoCorridaSrv.ApiV1SolicitacaoCorridaByIdDelete(id).toPromise().then(resp =>
			{
				processResponse(resp as ApiResponse<boolean>, resolve, reject);
			}).catch(reason => reject(reason));
		});
	}
}

@Injectable()
export class CatalogoSolicitacaoCorrida extends ApiCatalog<SolicitacaoCorridaSummary>
{
	constructor(private oauthService: OAuthService, private tarifaSrv: SolicitacaoCorridaService)
	{
		super(oauthService, new SolicitacaoCorridaApiInterface(tarifaSrv), 'solicitacao_corrida', 'solicitacao_corrida');
	}
}
