/* tslint:disable */
import { ContatoSummary } from './contato-summary';
import { Notification } from './notification';
export interface ResponseIEnumerableContatoSummary {

  /**
   * Dados vinculados à resposta da operação (de qualquer formato)
   */
  data?: Array<ContatoSummary>;

  /**
   * Indica se a operação foi bem sucedida
   */
  success?: boolean;

  /**
   * Notificações do domínio.
   */
  notifications?: Array<Notification>;
}
