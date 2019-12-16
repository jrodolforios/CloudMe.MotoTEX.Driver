/* tslint:disable */
import { SolicitacaoCorridaSummary } from './solicitacao-corrida-summary';
import { Notification } from './notification';
export interface ResponseIListSolicitacaoCorridaSummary {

  /**
   * Dados vinculados à resposta da operação (de qualquer formato)
   */
  data?: Array<SolicitacaoCorridaSummary>;

  /**
   * Utilizado para paginação de resultados
   */
  count?: number;

  /**
   * Indica se a operação foi bem sucedida
   */
  success?: boolean;

  /**
   * Notificações do domínio.
   */
  notifications?: Array<Notification>;
}