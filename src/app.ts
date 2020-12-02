import * as Express from 'express';
import * as list from './service/list';
import * as execute from './service/execute';
import * as form from './service/form';
import { Logger } from './utils/logger';

const app = Express();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true, limit: '500mb' }));
app.use((req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  const logger = new Logger(0);
  if (req.get('Authorization') !== `Token token="${process.env.SECRET_TOKEN}"`) {
    logger.error('Authorization Code is incorrect');
    res.sendStatus(400);
    return;
  }
  next();
});

app.get('/', (req: Express.Request, res: Express.Response) => {
  return res.status(200).send('Hello World!');
});

app.post('/action', async (req: Express.Request, res: Express.Response) => {
  const resBody: any = await list.handler(req);
  return res.status(200).send(resBody);
});

app.post('/action/execute', async (req: Express.Request, res: Express.Response) => {
  const logger = new Logger(0);
  await execute.handler(req).catch(error => {
    logger.error(error.message);
    return res.sendStatus(400);
  });
  return res.sendStatus(200);
});

app.post('/action/form', async (req: Express.Request, res: Express.Response) => {
  const resform = await form.handler(req);
  return res.status(200).send(resform);
});

export default app;
