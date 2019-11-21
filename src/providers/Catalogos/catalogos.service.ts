import { Injectable } from '@angular/core';
import { CatalogoCorrida } from '../Catalogos/catalogo-corrida.service';
import { CatalogoSolicitacaoCorrida } from '../Catalogos/catalogo-solicitacao-corrida.service';

@Injectable()
export class CatalogosService
{
	catalogoCarregamento = '';

	constructor(
		public corrida:CatalogoCorrida,
		public solicitacaoCorrida: CatalogoSolicitacaoCorrida,
	)
	{
	}
}
