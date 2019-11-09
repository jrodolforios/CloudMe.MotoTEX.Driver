/* tslint:disable */
import { VeiculoTaxistaSummary } from './veiculo-taxista-summary';
import { Notification } from './notification';
export interface ResponseIEnumerableVeiculoTaxistaSummary {

  /**
   * Dados vinculados à resposta da operação (de qualquer formato)
   */
  data?: Array<VeiculoTaxistaSummary>;

  /**
   * Indica se a operação foi bem sucedida
   */
  success?: boolean;

  /**
   * Notificações do domínio.
   */
  notifications?: Array<Notification>;
}