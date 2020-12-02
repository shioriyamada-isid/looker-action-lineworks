import * as Express from 'express';
import * as list from './service/list';
import * as execute from './service/execute';
import * as form from './service/form';
import { Logger } from './utils/logger';
import * as psql from './db/psql';
import * as request from 'supertest';

const PORT = 3000;
const app = Express();
const logger = new Logger(0);

app.use(Express.json());
app.use(Express.urlencoded({ extended: true, limit: '500mb' }));
// create Mock

afterAll(() => {
  app.close;
});

describe('test', () => {
  it('success');
});
