import Express from 'express';
import fetch from 'node-fetch';
import * as csvParse from 'csv-parse';
import { Messenger } from './messenger';
import { Logger } from '../utils/logger';

export const handler = async (req: Express.Request) => {
  const reqBody = req.body;

  if (!reqBody.form_params) {
    throw new Error('必須項目が入力されていません。');
  } else {
    if (!reqBody.form_params.lineworks_message) {
      throw new Error('LINEWORKSユーザへのメッセージが入力されていません。');
    } else if (reqBody.form_params.lineworks_message.length > 100) {
      throw new Error('LINEWORKSユーザへのメッセージが100文字を超えています。');
    }
    if (!reqBody.form_params.line_message) {
      throw new Error('送信先の方へのメッセージテンプレートが入力されていません。');
    } else if (reqBody.form_params.line_message.length > 75) {
      throw new Error('送信先の方へのメッセージテンプレートが75文字を超えています。');
    }
  }

  await invokeHandler(reqBody);
};

export const invokeHandler = async (req: any) => {
  const logger = new Logger(req.scheduled_plan.scheduled_plan_id);
  const cnt = await sendMessages(req, logger);
  if (cnt.sendCount === cnt.msgCount) {
    logger.info(`[${cnt.sendCount}/${cnt.msgCount}]件のメッセージを送信しました。`);
  } else {
    logger.error(`[${cnt.sendCount}/${cnt.msgCount}]件のメッセージを送信しました。`);
  }
};

const sendMessages = (req: any, logger: Logger): Promise<{ sendCount: number; msgCount: number }> => {
  return new Promise<any>((resolve, reject) => {
    const messenger: Messenger = new Messenger();
    const url = req.scheduled_plan.download_url;
    const parser = csvParse({
      delimiter: '\t',
      columns: true,
    });
    let isSkip: boolean = false;
    parser.on('readable', () => {
      if (!isSkip) {
        isSkip = true;
        const column = {
          lineworksId: req.data.lineworks_id || 'LineworksId',
          lineId: req.data.line_id || 'LineID',
          lineName: req.data.line_name || 'LineName',
        };
        const message = {
          lineworks: req.form_params.lineworks_message,
          line: req.form_params.line_message,
        };
        messenger
          .sendMessages(column, message, parser)
          .then((result: { sendCount: number; msgCount: number }) => {
            resolve(result);
          })
          .catch(e => {
            reject(e);
          });
      }
    });

    parser.on('error', err => {
      logger.error('集計データの読み込みでエラーが発生しました。');
      reject(err);
    });

    fetch(url).then(response => {
      response.body.pipe(parser);
    });
  });
};
