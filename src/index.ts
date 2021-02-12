import { AutomationExecution, IntegrationMessageReturnBatch, Metadata } from '@4success/tunnelhub-sdk';
import { BatchDeltaIntegrationFlow } from '@4success/tunnelhub-sdk/src/classes/flows/batchDeltaIntegrationFlow';
import { ProxyResult } from 'aws-lambda';
import got from 'got';
import * as mysql from 'mysql';
import { FieldInfo } from 'mysql';
import * as moment from 'moment';

/**
 * Integration main type
 */
type CovidCases = {
  stateName: string;
  confirmed: number;
  recovered: number;
  deaths: number;
  updated: string
};

/**
 * This is our entry point for start automation executing.
 * You can personalize the success and error messages according your needs
 * It is mandatory execute the AutomationExecution.executeAutomation method
 *
 * @param event
 */
export const handler = async (event: any): Promise<ProxyResult> => {
  const execution = new Integration(event);
  await AutomationExecution.executeAutomation(execution);

  if (execution.hasAnyErrors()) {
    throw Error('Error!');
  }
  return {
    statusCode: 200,
    body: 'Automation executed with no errors!',
  };
};

type MySqlResult = {
  results: CovidCases[];
  fields: FieldInfo[];
}

/**
 * This is our main class that will be responsible to process our automation
 * Basically, you only need to implement the abstract methods and write your business logic
 *
 * We provide importante instructions for all methods
 */
export class Integration extends BatchDeltaIntegrationFlow {
  private static keyFields: string[] = [
    'stateName',
  ];
  private static deltaFields: string[] = [
    'confirmed',
    'recovered',
    'deaths',
    'updated',
  ];
  private connection: mysql.Connection;
  private systems: any[];

  /**
   * It is mandatory have the constructor and call the super with event of main handler
   * You can get the systems configured in automation and save in class property for further use
   * @param event
   */
  constructor(event: any) {
    super(event, Integration.keyFields, Integration.deltaFields);
    this.systems = event.systems ?? [];
  }

  /**
   * Return all columns that will be visible in monitoring screen.
   * The components order is the display orden in monitoring table
   *
   * The implementation of this method is mandatory
   */
  defineMetadata(): Metadata[] {
    return [
      {
        fieldName: 'stateName',
        fieldLabel: 'State name',
        fieldType: 'TEXT',
      },
      {
        fieldName: 'confirmed',
        fieldLabel: 'Confirmed cases',
        fieldType: 'NUMBER',
      },
      {
        fieldName: 'recovered',
        fieldLabel: 'Recovered cases',
        fieldType: 'NUMBER',
      },
      {
        fieldName: 'deaths',
        fieldLabel: 'Deaths',
        fieldType: 'NUMBER',
      },
      {
        fieldName: 'updated',
        fieldLabel: 'Last updated at',
        fieldType: 'DATETIME',
      },
    ];
  }

  /**
   * Return the source system data as a plain array of objets
   *
   * This is the method where you will extract your source data
   * If your automation is a webhook, the payload sent by caller will be avaiable
   * in "payload" parameter.
   *
   * The implementation of this method is mandatory
   *
   * @param payload
   */
  async loadSourceSystemData(payload?: any): Promise<CovidCases[]> {
    /**
     * You can get credentials form associated systems with:
     * const system = this.systems.find(value => value.internalName === 'INTERNAL_SYSTEM_NAME');
     */
    const sourceSystemData: CovidCases[] = [];
    const gotResponse = await got(`https://covid-api.mmediagroup.fr/v1/cases?ab=BR`);

    const covidCases: CovidCases[] = JSON.parse(gotResponse.body);
    for (const state in covidCases) {
      if (state === 'All') {
        continue;
      }
      if (covidCases.hasOwnProperty(state)) {
        sourceSystemData.push({
          stateName: state,
          confirmed: state === 'Acre' ? 1000 : covidCases[state].confirmed,
          recovered: covidCases[state].recovered,
          deaths: covidCases[state].deaths,
          updated: moment(covidCases[state].updated, 'YYYY/MM/DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
        });
      }
    }
    return sourceSystemData;
  }

  async loadTargetSystemData(): Promise<CovidCases[]> {
    const connection = this.createConnection();

    const queryResult: MySqlResult = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM covidCases', function(error, results, fields) {
        if (error) {
          reject(error);
        } else {
          resolve({
            results,
            fields,
          });
        }
      });
    });

    return queryResult.results.map(item => {
      item.updated = moment(item.updated, 'YYYY/MM/DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
      return item;
    });
  }

  async batchInsertAction(packedItems: CovidCases[]): Promise<IntegrationMessageReturnBatch[]> {
    const returnMessages: IntegrationMessageReturnBatch[] = [];

    const connection = this.createConnection();

    for (let i = 0; i < packedItems.length; i++) {
      const item = packedItems[i];

      try {
        await new Promise((resolve, reject) => {
          connection.query(`INSERT INTO covidCases SET ?`, item, function(error, results, fields) {
            if (error) {
              reject(error);
            } else {
              resolve({
                results,
                fields,
              });
            }
          });
        });

        returnMessages.push({
          status: 'SUCCESS',
          data: {},
          message: 'Item inserido com sucesso',
        });
      } catch (e) {
        returnMessages.push({
          status: 'FAIL',
          data: {},
          message: e.message,
        });
      }
    }


    return returnMessages;
  }

  async batchUpdateAction(oldPackedItems: CovidCases[], newPackedItems: CovidCases[]): Promise<IntegrationMessageReturnBatch[]> {
    const returnMessages: IntegrationMessageReturnBatch[] = [];
    const connection = this.createConnection();

    for (let i = 0; i < newPackedItems.length; i++) {
      const newItem = newPackedItems[i];

      await new Promise((resolve, reject) => {
        connection.query(`UPDATE covidCases
                          SET confirmed = ?,
                              recovered = ?,
                              deaths    = ?,
                              updated   = ?
                          WHERE stateName = ?`, [
          newItem.confirmed,
          newItem.recovered,
          newItem.deaths,
          newItem.updated,
          newItem.stateName,
        ], (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              results,
              fields,
            });
          }
        });
      });

      returnMessages.push({
        status: 'SUCCESS',
        data: {},
        message: 'Item atualizado com sucesso',
      });
    }

    return returnMessages;
  }

  async batchDeleteAction(packedItems: CovidCases[]): Promise<IntegrationMessageReturnBatch[]> {
    const returnMessages: IntegrationMessageReturnBatch[] = [];
    const connection = this.createConnection();

    for (let i = 0; i < packedItems.length; i++) {
      const item = packedItems[i];

      await new Promise((resolve, reject) => {
        connection.query(`DELETE
                          FROM covidCases
                          WHERE stateName = ?`, [
          item.stateName,
        ], (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              results,
              fields,
            });
          }
        });
      });

      returnMessages.push({
        status: 'SUCCESS',
        data: {},
        message: 'Item apagado com sucesso',
      });
    }

    return returnMessages;
  }

  protected async preProcessingCustomerRoutines(): Promise<void> {
    this.createConnection();
  };

  protected async postProcessingCustomerRoutines(): Promise<void> {
    this.closeConnection();
  }

  private createConnection(): mysql.Connection {
    if (!this.connection) {
      return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test',
      });
    }
    return this.connection;
  }

  private closeConnection(): void {
    if (this.connection) {
      this.connection.end();
    }
  }
}
