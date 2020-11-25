import * as request from 'request';
import * as csvParse from 'csv-parse';
import { Logger } from '../utils/logger';
import { LineworksAccessTokenController } from '../controller/lineworksAccessTokenController';

export class Messenger {
  private messagePushUrl: string;
  private consumerKey: string;
  private token?: string;
  private logger: Logger;

  constructor(logger: Logger) {
    this.messagePushUrl = `https://apis.worksmobile.com/r/${process.env.LINEWORKS_API_ID}/message/v1/bot/${process.env.LINEWORKS_BOT_NO}/message/push`;
    this.consumerKey = process.env.LINEWORKS_CONSUMER_KEY || '';
    this.logger = logger;
  }
  
  sendMessages = async (
    column: { fromId: string; toId: string; toName: string },
    message: { from: string; to: string },
    parser: csvParse.Parser
  ): Promise<{ sendCount: number; msgCount: number }> => {
    if (!this.token) {
      const lineworksAccessTokenController = new LineworksAccessTokenController();
      this.token = await lineworksAccessTokenController.getValidAccessToken();
    }

    let colFromId: string = '';
    let colToId: string = '';
    let colToName: string = '';
    const msgData: { [key: string]: Array<{ customerId: number; customerName: string }> } = {};

    let isErr: boolean = false;
    let msgCount: number = 0;
    for await (const data of parser) {
      msgCount++;
      if (msgCount === 1) {
        for (const col in data) {
          if (col.substr(-column.fromId.length) === column.fromId) {
            colFromId = col;
          } else if (col.substr(-column.toId.length) === column.toId) {
            colToId = col;
          } else if (col.substr(-column.toName.length) === column.toName) {
            colToName = col;
          }
        }
      }
      
      if (!colFromId) {
        isErr = true;
        this.logger.error(`集計データに ${column.fromId} 列がありません。`);
      }
      if (!colToId) {
        isErr = true;
        this.logger.error(`集計データに ${column.toId} 列がありません。`);
      }
      if (!colToName) {
        isErr = true;
        this.logger.error(`集計データに ${column.toName} 列がありません。`);
      }

      if (isErr) {
        continue;
      }

      let customerList = msgData[data[colFromId]];
      if (!customerList) {
        customerList = [];
        msgData[data[colFromId]] = customerList;
      }
      customerList.push({ customerId: data[colToId], customerName: data[colToName] });
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
    message: { from: string; to: string }
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const actions = [];

      for (const customer of customers) {
        actions.push({
          type: 'uri',
          label: customer.customerName + '様へメッセージを送る',
          uri: 'lineworks://message/send?version=15&message=' + encodeURI(message.to) + '&worksAtIdList=' + customer.customerId,
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
            contentText: message.from,
            actions: actions,
          },
        },
      };

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
