import * as request from 'request';
import * as csvParse from 'csv-parse';
import { Logger } from '../utils/util';
import { LineworksAccessTokenController } from '../controller/lineworksAccessTokenController';

export class Messenger {
  private messagePushUrl: string;
  private consumerKey: string;
  private token?: string;
  private logger: Logger;

  constructor(botNo: string, logger: Logger) {
    this.messagePushUrl = 'https://apis.worksmobile.com/r/' + process.env.LINEWORKS_API_ID + '/message/v1/bot/' + botNo + '/message/push';
    this.consumerKey = process.env.LINEWORKS_CONSUMER_KEY || '';
    this.logger = logger;
  }

  sendMessages = async (column: any, message: any, parser: csvParse.Parser): Promise<{ sendCount: number; msgCount: number }> => {
    if (!this.token) {
      const lineworksAccessTokenController = new LineworksAccessTokenController();
      this.token = await lineworksAccessTokenController.getValidAccessToken();
    }
    let colMemberId: string = '';
    let colCustomerId: string = '';
    let colCustomerName: string = '';
    const msgData: { [key: string]: Array<{ customerId: number; customerName: string }> } = {};

    let isErr: boolean = false;
    let msgCount: number = 0;
    for await (const data of parser) {
      msgCount++;
      if (msgCount === 1) {
        for (const col in data) {
          if (col.substr(-column.memberId.length) === column.memberId) {
            colMemberId = col;
          } else if (col.substr(-column.customerId.length) === column.customerId) {
            colCustomerId = col;
          } else if (col.substr(-column.customerName.length) === column.customerName) {
            colCustomerName = col;
          }
        }
      }

      if (!colMemberId) {
        isErr = true;
        this.logger.error(`集計データに ${column.memberId} 列がありません。`);
      }
      if (!colCustomerId) {
        isErr = true;
        this.logger.error(`集計データに ${column.customerId} 列がありません。`);
      }
      if (!colCustomerName) {
        isErr = true;
        this.logger.error(`集計データに ${column.customerName} 列がありません。`);
      }

      if (isErr) {
        continue;
      }

      let customerList = msgData[data[colMemberId]];
      if (!customerList) {
        customerList = [];
        msgData[data[colMemberId]] = customerList;
      }
      customerList.push({ customerId: data[colCustomerId], customerName: data[colCustomerName] });
    }

    let sendCount = 0;

    for (const member in msgData) {
      const customersData = msgData[member];

      let tmpCustomers: any[] = [];
      for (const customer of customersData) {
        tmpCustomers.push(customer);
        sendCount++;

        if (tmpCustomers.length === 10) {
          const customers: any[] = tmpCustomers;
          tmpCustomers = [];

          try {
            await this.messagePush(member, customers, message);
            await sleep(500);
          } catch (e) {
            console.error(e);
            return { sendCount: sendCount, msgCount: msgCount };
          }
        }
      }

      if (tmpCustomers.length > 0) {
        const customers: any[] = tmpCustomers;
        tmpCustomers = [];

        try {
          await this.messagePush(member, customers, message);
          await sleep(500);
        } catch (e) {
          console.error(e);
          return { sendCount: sendCount, msgCount: msgCount };
        }
      }
    }
    return { sendCount: sendCount, msgCount: msgCount };
  };

  private messagePush(
    member: string,
    customers: Array<{ customerId: number; customerName: string }>,
    message: { toMember: string; toCustomer: string }
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const actions = [];

      for (const customer of customers) {
        actions.push({
          type: 'uri',
          label: customer.customerName + '様へメッセージを送る',
          uri: 'lineworks://message/send?version=15&message=' + encodeURI(message.toCustomer) + '&worksAtIdList=' + customer.customerId,
        });
      }

      const options: request.Options = {
        uri: this.messagePushUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          consumerKey: this.consumerKey,
          Authorization: `Bearer ${this.token}`,
        },
        json: {
          accountId: member,
          content: {
            type: 'button_template',
            contentText: message.toMember,
            actions: actions,
          },
        },
      };

      this.logger.info(`Message Push\njson: ${JSON.stringify(options)}`);

      request.post(options, (err, res) => {
        if (err) {
          this.logger.error('メッセージ送信APIからエラーが返却されました。');
          reject(err);
        } else if (res.statusCode === 200) {
          resolve(res.statusCode);
        } else {
          this.logger.error(`メッセージ送信APIからエラーコード(${res.statusCode})が返却されました。`);
          reject(res.body);
        }
      });
    });
  }
}

const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));
