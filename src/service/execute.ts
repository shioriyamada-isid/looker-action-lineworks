import Express from 'express';
import * as request from 'request';
import * as csvParse from 'csv-parse';
import { Messenger } from './messenger';
import { Logger } from '../utils/logger';

export const handler = async (req: Express.Request) => {
  const reqBody = req.body;
  const logger = new Logger(reqBody.scheduled_plan.scheduled_plan_id);

  // check
  try {
    if (!reqBody.form_params) {
      throw new Error('必須項目が入力されていません。');
    } else {
      if (!reqBody.form_params.from_message) {
        throw new Error('送信元の方へのメッセージが入力されていません。');
      } else if (reqBody.form_params.from_message.length > 100) {
        throw new Error('送信元の方へのメッセージが100文字を超えています。');
      }
      if (!reqBody.form_params.to_message) {
        throw new Error('送信先の方へのメッセージテンプレートが入力されていません。');
      } else if (reqBody.form_params.to_message.length > 75) {
        throw new Error('送信先の方へのメッセージテンプレートが75文字を超えています。');
      }
    }

    await invokeHandler(reqBody, logger);
  } catch (e) {
    logger.error(JSON.stringify(e));
  }
};

export const invokeHandler = async (req: any, logger: Logger) => {
  const cnt = await sendMessages(req, logger);
  if (cnt.sendCount === cnt.msgCount) {
    logger.info(`[${cnt.sendCount}/${cnt.msgCount}]件のメッセージを送信しました。`);
  } else {
    logger.error(`[${cnt.sendCount}/${cnt.msgCount}]件のメッセージを送信しました。`);
  }
};

const sendMessages = (req: any, logger: Logger): Promise<{ sendCount: number; msgCount: number }> => {
  return new Promise<any>((resolve, reject) => {
    const messenger: Messenger = new Messenger(logger);
    const url = req.scheduled_plan.download_url;
    const parser = csvParse({
      delimiter: '\t',
      columns: true,
    });
    let isSkip: boolean = false;
    parser.on('readable', () => {
      if (!isSkip) {
        isSkip = true;
        // TODO form_paramに変換
        const column = {
          fromId: req.data.from_id || 'FromID',
          toId: req.data.to_id || 'ToID',
          toName: req.data.to_name || 'ToName',
        };
        const message = {
          from: req.form_params.from_message,
          to: req.form_params.to_message,
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

    request.get(url).pipe(parser);
  });
};
