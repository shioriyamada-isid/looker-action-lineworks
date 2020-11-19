import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import lineworksAccessToken from '../entity/lineworksAccessToken';

// TODO envから取得
const dbConfig: PostgresConnectionOptions = {
  type: 'postgres',
  url:
    process.env.DATABASE_URL ||
    'postgres://lkfeefpguilbvz:23970d3efa21d3db40196a7dc64c4cfd6b247fc1b077254add2130bb74f6635d@ec2-54-157-4-216.compute-1.amazonaws.com:5432/d1o4urcmno3cmh',
  synchronize: false,
  logging: false,
  entities: [lineworksAccessToken],
};
export default dbConfig;
