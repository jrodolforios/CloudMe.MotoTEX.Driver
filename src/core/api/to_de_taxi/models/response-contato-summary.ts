/* tslint:disable */
import { ContatoSummary } from './contato-summary';
import { Notification } from './notification';
export interface ResponseContatoSummary {

  /**
   * Dados vinculados à resposta da operação (de qualquer formato)
   */
  data?: ContatoSummary;

  /**
   * Indica se a operação foi bem sucedida
   */
  success?: boolean;

  /**
   * Notificações do domínio.
   */
  notifications?: Array<Notification>;
}
