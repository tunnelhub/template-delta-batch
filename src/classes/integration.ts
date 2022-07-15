import { BatchDeltaIntegrationFlow } from '@4success/tunnelhub-sdk/src/classes/flows/batchDeltaIntegrationFlow';
import { GenericParameter, IntegrationMessageReturnBatch, Metadata } from '@4success/tunnelhub-sdk';
import { TunnelHubSystem } from '@4success/tunnelhub-sdk/src/types/data';
import { IntegrationModel } from '../data';

export default class Integration extends BatchDeltaIntegrationFlow {
  private static keyFields: string[] = [
    'key_field',
  ];
  private static deltaFields: string[] = [
    'regular_field',
  ];

  private readonly parameters: { custom: GenericParameter[] };
  private readonly systems: TunnelHubSystem[];

  constructor(event: any, context: any) {
    super(event, Integration.keyFields, Integration.deltaFields, context);
    this.systems = event.systems ?? [];
    this.parameters = event.parameters ?? {};
    this.packageSize = 50.;
    /**
     this.
     * It is mandatory to have the constructor call the super with the event of the main handler.
     * You can get the systems configured in automation and save them in a class attribute for further use.
     * You also can define the package size for batch items.
     */
  }

  /* istanbul ignore next */
  defineMetadata(): Metadata[] {
    /**
     * Return all columns that will be visible on the monitoring screen.
     * The components order is the display order in the monitoring table.
     *
     * The implementation of this method is mandatory
     */
    return [
      {
        fieldName: 'key_field',
        fieldLabel: 'Key field',
        fieldType: 'TEXT',
      },
      {
        fieldName: 'regular_field',
        fieldLabel: 'Regular field',
        fieldType: 'TEXT',
      },
    ];
  }


  async loadSourceSystemData(payload?: any): Promise<IntegrationModel[]> {
    /**5
     * Return the source system data as a plain array of objects
     *
     * This is the method where you will extract your source data
     * If your automation is a webhook, the payload sent will be available in the "payload" parameter.
     *
     * The implementation of this method is mandatory
     */
    return [
      {
        key_field: '1',
        regular_field: 'anyString',
      },
      {
        key_field: '2',
        regular_field: 'anotherString',
      },
    ];
  }

  async loadTargetSystemData(): Promise<IntegrationModel[]> {
    /**
     * Returns target source system data as a plain array of objects
     * This is the method where you will extract your target data for delta calculation
     */
    return [
      {
        key_field: '2',
        regular_field: 'oldAnotherString',
      },
      {
        key_field: '3',
        regular_field: 'anyotherstring',
      },
    ];
  }

  async batchInsertAction(packedItems: IntegrationModel[]): Promise<IntegrationMessageReturnBatch[]> {
    const returnMessages: IntegrationMessageReturnBatch[] = [];

    for (let i = 0; i < packedItems.length; i++) {
      const item = packedItems[i];
      /**
       * Create new items in the target system and return a message array to the monitoring
       */
      try {
        returnMessages.push({
          status: 'SUCCESS',
          data: {},
          message: 'Inserted successfully',
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

  async batchUpdateAction(oldPackedItems: IntegrationModel[], newPackedItems: IntegrationModel[]): Promise<IntegrationMessageReturnBatch[]> {
    const returnMessages: IntegrationMessageReturnBatch[] = [];

    for (let i = 0; i < newPackedItems.length; i++) {
      const oldItem = newPackedItems[i];
      const newItem = newPackedItems[i];
      /**
       * Update existing items in the target system and return a message to the monitoring
       */
      try {
        returnMessages.push({
          status: 'SUCCESS',
          data: {},
          message: 'Updated successfully',
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

  async batchDeleteAction(packedItems: IntegrationModel[]): Promise<IntegrationMessageReturnBatch[]> {
    const returnMessages: IntegrationMessageReturnBatch[] = [];

    for (let i = 0; i < packedItems.length; i++) {
      const item = packedItems[i];
      /**
       * Delete existing items in the target system not extracted from the source system and return a message to the monitoring
       */
      try {
        returnMessages.push({
          status: 'SUCCESS',
          data: {},
          message: 'Delete successfully',
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
}
