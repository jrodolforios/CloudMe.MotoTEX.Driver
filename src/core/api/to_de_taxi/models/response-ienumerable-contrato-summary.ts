/* tslint:disable */
import { ContratoSummary } from './contrato-summary';
import { Notification } from './notification';
export interface ResponseIEnumerableContratoSummary {

  /**
   * Dados vinculados à resposta da operação (de qualquer formato)
   */
  data?: Array<ContratoSummary>;

  /**
   * Indica se a operação foi bem sucedida
   */
  success?: boolean;

  /**
   * Notificações do domínio.
   */
  notifications?: Array<Notification>;
}
