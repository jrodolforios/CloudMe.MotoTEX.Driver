/* tslint:disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { BaseService as __BaseService } from '../base-service';
import { ApiConfiguration as __Configuration } from '../api-configuration';
import { StrictHttpResponse as __StrictHttpResponse } from '../strict-http-response';
import { Observable as __Observable } from 'rxjs';
import { map as __map, filter as __filter } from 'rxjs/operators';

import { ResponseIEnumerableUsuarioSummary } from '../models/response-ienumerable-usuario-summary';
import { ResponseBoolean } from '../models/response-boolean';
import { UsuarioSummary } from '../models/usuario-summary';
import { ResponseGuid } from '../models/response-guid';
import { ResponseUsuarioSummary } from '../models/response-usuario-summary';
import { ResponseDateTime } from '../models/response-date-time';
import { CredenciaisUsuario } from '../models/credenciais-usuario';
@Injectable({
  providedIn: 'root',
})
class UsuarioService extends __BaseService {
  static readonly ApiV1UsuarioGetPath = '/api/v1/Usuario';
  static readonly ApiV1UsuarioPutPath = '/api/v1/Usuario';
  static readonly ApiV1UsuarioPostPath = '/api/v1/Usuario';
  static readonly ApiV1UsuarioAdminsGetPath = '/api/v1/Usuario/admins';
  static readonly ApiV1UsuarioByIdGetPath = '/api/v1/Usuario/{id}';
  static readonly ApiV1UsuarioByIdDeletePath = '/api/v1/Usuario/{id}';
  static readonly ApiV1UsuarioLoginDisponivelGetPath = '/api/v1/Usuario/login_disponivel';
  static readonly ApiV1UsuarioGetDataHoraGetPath = '/api/v1/Usuario/get_data_hora';
  static readonly ApiV1UsuarioAlteraCredenciaisByIdPostPath = '/api/v1/Usuario/altera_credenciais/{id}';
  static readonly ApiV1UsuarioBloquearByIdPostPath = '/api/v1/Usuario/bloquear/{id}';
  static readonly ApiV1UsuarioInformarDeviceTokenByIdPostPath = '/api/v1/Usuario/informar_device_token/{id}';

  constructor(
    config: __Configuration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * @return Success
   */
  ApiV1UsuarioGetResponse(): __Observable<__StrictHttpResponse<ResponseIEnumerableUsuarioSummary>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    let req = new HttpRequest<any>(
      'GET',
      this.rootUrl + `/api/v1/Usuario`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<ResponseIEnumerableUsuarioSummary>;
      })
    );
  }
  /**
   * @return Success
   */
  ApiV1UsuarioGet(): __Observable<ResponseIEnumerableUsuarioSummary> {
    return this.ApiV1UsuarioGetResponse().pipe(
      __map(_r => _r.body as ResponseIEnumerableUsuarioSummary)
    );
  }

  /**
   * @param UsuarioSummary Modified Usuario list's properties summary
   * @return Success
   */
  ApiV1UsuarioPutResponse(UsuarioSummary?: UsuarioSummary): __Observable<__StrictHttpResponse<ResponseBoolean>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    __body = UsuarioSummary;
    let req = new HttpRequest<any>(
      'PUT',
      this.rootUrl + `/api/v1/Usuario`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<ResponseBoolean>;
      })
    );
  }
  /**
   * @param UsuarioSummary Modified Usuario list's properties summary
   * @return Success
   */
  ApiV1UsuarioPut(UsuarioSummary?: UsuarioSummary): __Observable<ResponseBoolean> {
    return this.ApiV1UsuarioPutResponse(UsuarioSummary).pipe(
      __map(_r => _r.body as ResponseBoolean)
    );
  }

  /**
   * @param UsuarioSummary Usuario's summary
   * @return Success
   */
  ApiV1UsuarioPostResponse(UsuarioSummary?: UsuarioSummary): __Observable<__StrictHttpResponse<ResponseGuid>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    __body = UsuarioSummary;
    let req = new HttpRequest<any>(
      'POST',
      this.rootUrl + `/api/v1/Usuario`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<ResponseGuid>;
      })
    );
  }
  /**
   * @param UsuarioSummary Usuario's summary
   * @return Success
   */
  ApiV1UsuarioPost(UsuarioSummary?: UsuarioSummary): __Observable<ResponseGuid> {
    return this.ApiV1UsuarioPostResponse(UsuarioSummary).pipe(
      __map(_r => _r.body as ResponseGuid)
    );
  }

  /**
   * @return Success
   */
  ApiV1UsuarioAdminsGetResponse(): __Observable<__StrictHttpResponse<ResponseIEnumerableUsuarioSummary>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    let req = new HttpRequest<any>(
      'GET',
      this.rootUrl + `/api/v1/Usuario/admins`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<ResponseIEnumerableUsuarioSummary>;
      })
    );
  }
  /**
   * @return Success
   */
  ApiV1UsuarioAdminsGet(): __Observable<ResponseIEnumerableUsuarioSummary> {
    return this.ApiV1UsuarioAdminsGetResponse().pipe(
      __map(_r => _r.body as ResponseIEnumerableUsuarioSummary)
    );
  }

  /**
   * @param id undefined
   * @return Success
   */
  ApiV1UsuarioByIdGetResponse(id: string): __Observable<__StrictHttpResponse<ResponseUsuarioSummary>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    let req = new HttpRequest<any>(
      'GET',
      this.rootUrl + `/api/v1/Usuario/${id}`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<ResponseUsuarioSummary>;
      })
    );
  }
  /**
   * @param id undefined
   * @return Success
   */
  ApiV1UsuarioByIdGet(id: string): __Observable<ResponseUsuarioSummary> {
    return this.ApiV1UsuarioByIdGetResponse(id).pipe(
      __map(_r => _r.body as ResponseUsuarioSummary)
    );
  }

  /**
   * @param id DialList's ID
   * @return Success
   */
  ApiV1UsuarioByIdDeleteResponse(id: string): __Observable<__StrictHttpResponse<ResponseBoolean>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    let req = new HttpRequest<any>(
      'DELETE',
      this.rootUrl + `/api/v1/Usuario/${id}`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<ResponseBoolean>;
      })
    );
  }
  /**
   * @param id DialList's ID
   * @return Success
   */
  ApiV1UsuarioByIdDelete(id: string): __Observable<ResponseBoolean> {
    return this.ApiV1UsuarioByIdDeleteResponse(id).pipe(
      __map(_r => _r.body as ResponseBoolean)
    );
  }

  /**
   * @param login undefined
   * @return Success
   */
  ApiV1UsuarioLoginDisponivelGetResponse(login?: string): __Observable<__StrictHttpResponse<ResponseBoolean>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    if (login != null) __params = __params.set('login', login.toString());
    let req = new HttpRequest<any>(
      'GET',
      this.rootUrl + `/api/v1/Usuario/login_disponivel`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<ResponseBoolean>;
      })
    );
  }
  /**
   * @param login undefined
   * @return Success
   */
  ApiV1UsuarioLoginDisponivelGet(login?: string): __Observable<ResponseBoolean> {
    return this.ApiV1UsuarioLoginDisponivelGetResponse(login).pipe(
      __map(_r => _r.body as ResponseBoolean)
    );
  }

  /**
   * @return Success
   */
  ApiV1UsuarioGetDataHoraGetResponse(): __Observable<__StrictHttpResponse<ResponseDateTime>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    let req = new HttpRequest<any>(
      'GET',
      this.rootUrl + `/api/v1/Usuario/get_data_hora`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<ResponseDateTime>;
      })
    );
  }
  /**
   * @return Success
   */
  ApiV1UsuarioGetDataHoraGet(): __Observable<ResponseDateTime> {
    return this.ApiV1UsuarioGetDataHoraGetResponse().pipe(
      __map(_r => _r.body as ResponseDateTime)
    );
  }

  /**
   * @param params The `UsuarioService.ApiV1UsuarioAlteraCredenciaisByIdPostParams` containing the following parameters:
   *
   * - `id`: User ID
   *
   * - `credenciais`:
   *
   * @return Success
   */
  ApiV1UsuarioAlteraCredenciaisByIdPostResponse(params: UsuarioService.ApiV1UsuarioAlteraCredenciaisByIdPostParams): __Observable<__StrictHttpResponse<ResponseBoolean>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    __body = params.credenciais;
    let req = new HttpRequest<any>(
      'POST',
      this.rootUrl + `/api/v1/Usuario/altera_credenciais/${params.id}`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<ResponseBoolean>;
      })
    );
  }
  /**
   * @param params The `UsuarioService.ApiV1UsuarioAlteraCredenciaisByIdPostParams` containing the following parameters:
   *
   * - `id`: User ID
   *
   * - `credenciais`:
   *
   * @return Success
   */
  ApiV1UsuarioAlteraCredenciaisByIdPost(params: UsuarioService.ApiV1UsuarioAlteraCredenciaisByIdPostParams): __Observable<ResponseBoolean> {
    return this.ApiV1UsuarioAlteraCredenciaisByIdPostResponse(params).pipe(
      __map(_r => _r.body as ResponseBoolean)
    );
  }

  /**
   * @param params The `UsuarioService.ApiV1UsuarioBloquearByIdPostParams` containing the following parameters:
   *
   * - `id`: ID do usu??rio
   *
   * - `bloquear`: Indica se o usu??rio ser?? ou n??o bloqueado
   *
   * @return Success
   */
  ApiV1UsuarioBloquearByIdPostResponse(params: UsuarioService.ApiV1UsuarioBloquearByIdPostParams): __Observable<__StrictHttpResponse<ResponseBoolean>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    if (params.bloquear != null) __params = __params.set('bloquear', params.bloquear.toString());
    let req = new HttpRequest<any>(
      'POST',
      this.rootUrl + `/api/v1/Usuario/bloquear/${params.id}`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<ResponseBoolean>;
      })
    );
  }
  /**
   * @param params The `UsuarioService.ApiV1UsuarioBloquearByIdPostParams` containing the following parameters:
   *
   * - `id`: ID do usu??rio
   *
   * - `bloquear`: Indica se o usu??rio ser?? ou n??o bloqueado
   *
   * @return Success
   */
  ApiV1UsuarioBloquearByIdPost(params: UsuarioService.ApiV1UsuarioBloquearByIdPostParams): __Observable<ResponseBoolean> {
    return this.ApiV1UsuarioBloquearByIdPostResponse(params).pipe(
      __map(_r => _r.body as ResponseBoolean)
    );
  }

  /**
   * @param params The `UsuarioService.ApiV1UsuarioInformarDeviceTokenByIdPostParams` containing the following parameters:
   *
   * - `id`: ID do usu??rio
   *
   * - `token`: Token de dispositivo
   *
   * @return Success
   */
  ApiV1UsuarioInformarDeviceTokenByIdPostResponse(params: UsuarioService.ApiV1UsuarioInformarDeviceTokenByIdPostParams): __Observable<__StrictHttpResponse<ResponseBoolean>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;

    if (params.token != null) __params = __params.set('token', params.token.toString());
    let req = new HttpRequest<any>(
      'POST',
      this.rootUrl + `/api/v1/Usuario/informar_device_token/${params.id}`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<ResponseBoolean>;
      })
    );
  }
  /**
   * @param params The `UsuarioService.ApiV1UsuarioInformarDeviceTokenByIdPostParams` containing the following parameters:
   *
   * - `id`: ID do usu??rio
   *
   * - `token`: Token de dispositivo
   *
   * @return Success
   */
  ApiV1UsuarioInformarDeviceTokenByIdPost(params: UsuarioService.ApiV1UsuarioInformarDeviceTokenByIdPostParams): __Observable<ResponseBoolean> {
    return this.ApiV1UsuarioInformarDeviceTokenByIdPostResponse(params).pipe(
      __map(_r => _r.body as ResponseBoolean)
    );
  }
}

module UsuarioService {

  /**
   * Parameters for ApiV1UsuarioAlteraCredenciaisByIdPost
   */
  export interface ApiV1UsuarioAlteraCredenciaisByIdPostParams {

    /**
     * User ID
     */
    id: string;
    credenciais?: CredenciaisUsuario;
  }

  /**
   * Parameters for ApiV1UsuarioBloquearByIdPost
   */
  export interface ApiV1UsuarioBloquearByIdPostParams {

    /**
     * ID do usu??rio
     */
    id: string;

    /**
     * Indica se o usu??rio ser?? ou n??o bloqueado
     */
    bloquear?: boolean;
  }

  /**
   * Parameters for ApiV1UsuarioInformarDeviceTokenByIdPost
   */
  export interface ApiV1UsuarioInformarDeviceTokenByIdPostParams {

    /**
     * ID do usu??rio
     */
    id: string;

    /**
     * Token de dispositivo
     */
    token?: string;
  }
}

export { UsuarioService }
