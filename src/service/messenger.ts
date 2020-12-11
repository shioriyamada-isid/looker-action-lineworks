import fetch from 'node-fetch';
import * as csvParse from 'csv-parse';
import { LineworksAccessTokenController } from '../controller/lineworksAccessTokenController';

interface CustomerMessage {
  customerId: number;
  customerName: string;
}

interface MessageData {
  [key: string]: CustomerMessage[];
}

export class Messenger {
  private messagePushUrl: string;
  private consumerKey: string;
  private token?: string;

  constructor() {
    this.messagePushUrl = `https://apis.worksmobile.com/r/${process.env.LINEWORKS_API_ID}/message/v1/bot/${process.env.LINEWORKS_BOT_NO}/message/push`;
    this.consumerKey = process.env.LINEWORKS_CONSUMER_KEY || '';
  }

  sendMessages = async (
    column: { fromId: string; toId: string; toName: string },
    message: { from: string; to: string },
    parser: csvParse.Parser
  ): Promise<{ sendCount: number; msgCount: number }> => {
    const lineworksAccessTokenController = new LineworksAccessTokenController();
    if (!this.token) {
      this.token = await lineworksAccessTokenController.getValidAccessToken();
    }
    let colFromId: string = '';
    let colToId: string = '';
    let colToName: string = '';
    const msgData: MessageData = {};
    let msgCount: number = 0;

    // const isErr: boolean = false;

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
        if (!colFromId) {
          throw new Error(`集計データに ${column.fromId} 列がありません。`);
        }
        if (!colToId) {
          throw new Error(`集計データに ${column.toId} 列がありません。`);
        }
        if (!colToName) {
          throw new Error(`集計データに ${column.toName} 列がありません。`);
        }
      }

      let customerList = msgData[data[colFromId]];
      if (!customerList) {
        customerList = [];
        msgData[data[colFromId]] = customerList;
      }

      // toNameが20文字を超えていた場合、20文字に切り下げを行い末尾に「...」を入れる処理
      const toName = data[colToName].length > 10 ? data[colToName].slice(0, 9) + '…' : data[colToName];
      customerList.push({ customerId: data[colToId], customerName: toName });
    }

    let sendCount = 0;

    console.log('msgData');
    console.log(msgData);
    for (const member in msgData) {
      const customerList = msgData[member];
      const tmpCustomerList = arrayChunk(customerList, 10);

      for (const customerList of tmpCustomerList) {
        sendCount += customerList.length;
        await this.messagePush(member, customerList, message);
        await sleep(500);
      }
    }
    return { sendCount: sendCount, msgCount: msgCount };
  };

  private messagePush = async (
    member: string,
    customers: Array<{ customerId: number; customerName: string }>,
    message: { from: string; to: string }
  ) => {
    const actions = [];
    for (const customer of customers) {
      actions.push({
        type: 'uri',
        label: customer.customerName + '様へメッセージを送る',
        uri: 'lineworks://message/send?version=15&message=' + encodeURI(message.to) + '&worksAtIdList=' + customer.customerId,
      });
    }
    const body = {
      accountId: member,
      content: {
        type: 'button_template',
        contentText: message.from,
        actions: actions,
      },
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        consumerKey: this.consumerKey,
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(body),
    };

    const response = await fetch(this.messagePushUrl, options);

    if (!response.ok) {
      if (response.status === 401 && response.statusText === 'Authentication failed') {
        const lineworksAccessTokenController = new LineworksAccessTokenController();
        this.token = await lineworksAccessTokenController.forceGetValidAccessToken();
        this.messagePush(member, customers, message);
      } else {
        throw new Error(`メッセージ送信APIからエラーコード(${response.status})が返却されました。`);
      }
    }
  };
}

const arrayChunk = ([...array], size = 1) => {
  return array.reduce((acc, value, index) => (index % size ? acc : [...acc, array.slice(index, index + size)]), []);
};

const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));
