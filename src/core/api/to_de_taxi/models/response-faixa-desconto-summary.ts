/* tslint:disable */
import { FaixaDescontoSummary } from './faixa-desconto-summary';
import { Notification } from './notification';
export interface ResponseFaixaDescontoSummary {

  /**
   * Dados vinculados à resposta da operação (de qualquer formato)
   */
  data?: FaixaDescontoSummary;

  /**
   * Indica se a operação foi bem sucedida
   */
  success?: boolean;

  /**
   * Notificações do domínio.
   */
  notifications?: Array<Notification>;
}
