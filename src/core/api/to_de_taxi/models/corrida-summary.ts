/* tslint:disable */
export interface CorridaSummary {
  id?: string;
  idSolicitacao?: string;
  idTaxista?: string;
  idVeiculo?: string;
  idRotaExecutada?: string;
  idTarifa?: string;
  inicio?: string;
  fim?: string;
  avaliacaoTaxista?: 0 | 1 | 2 | 3 | 4 | 5;
  avaliacaoPassageiro?: 0 | 1 | 2 | 3 | 4 | 5;
  status?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  tempoEmEspera?: number;
}
