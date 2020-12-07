import * as request from 'request-promise-native';
import * as jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import LineworksAccessToken from '../entity/lineworksAccessToken';

export class LineworksAccessTokenController {
  private serverId: string;
  private authKey: string;
  private tokenUrl: string;
  private repository: any;
  public token?: string;

  constructor() {
    this.serverId = process.env.LINEWORKS_SERVER_ID || '';
    this.authKey = process.env.LINEWORKS_SERVER_AUTH_KEY || '';
    this.tokenUrl = `https://auth.worksmobile.com/b/${process.env.LINEWORKS_API_ID}/server/token`;
    this.repository = getRepository(LineworksAccessToken);
  }

  private getJwt(): string {
    const jwtPayload = {
      iss: this.serverId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 10,
    };

    const jwtSecret = this.authKey;

    const jwtOptions = {
      header: {
        alg: 'RS256',
        typ: 'JWT',
      },
    };
    return jwt.sign(jwtPayload, jwtSecret, jwtOptions);
  }

  private getAccessToken(): Promise<LineworksAccessToken> {
    return new Promise((resolve, reject) => {
      const options: request.Options = {
        uri: this.tokenUrl,
        method: 'POST',
        json: true,
        form: {
          grant_type: 'urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer',
          assertion: this.getJwt(),
        },
      };
      request.post(options, (err, res, body) => {
        if (err) {
          console.log(err);
          reject(err);
        } else if (res.statusCode === 200) {
          const accessToken = new LineworksAccessToken();
          accessToken.accessToken = body.access_token;
          accessToken.tokenType = body.token_type;
          accessToken.expires_in = body.expires_in;
          resolve(accessToken);
        } else {
          console.log(err);
          reject(res);
        }
      });
    });
  }

  private checkValidTerm = (lineworksAccessToken: LineworksAccessToken): boolean => {
    const now: number = Date.now();
    if (lineworksAccessToken.updatedAt === undefined) return false;
    const timediff = now - (lineworksAccessToken.updatedAt.getTime() + lineworksAccessToken.expires_in * 1000);
    if (timediff < 0) {
      return true;
    } else {
      return false;
    }
  };

  private createAccessToken = async () => {
    const accessToken = await this.getAccessToken();
    await this.repository.insert(accessToken);
    return accessToken;
  };

  private readAccessToken = async () => {
    return await this.repository.findOne({ id: 'LINE_WORKS_ACCESS_TOKEN' });
  };

  private updateAccessToken = async (lineworksAccessToken: LineworksAccessToken) => {
    return await this.repository.update({ id: 'LINE_WORKS_ACCESS_TOKEN' }, lineworksAccessToken);
  };

  private deleteAccessToken = async (): Promise<LineworksAccessToken> => {
    return await this.repository.delete({ id: 'LINE_WORKS_ACCESS_TOKEN' });
  };

  public getValidAccessToken = async (): Promise<string> => {
    // DBから取得
    const prelwat = await this.readAccessToken(); // lineworks access token
    let postlwat = new LineworksAccessToken();
    // 取得できない、または、期限が切れている場合、新たに取得してDBをセット
    // 期限が有効な場合、updatedAtを更新して終了
    if (prelwat === undefined) {
      postlwat = await this.createAccessToken();
    } else if (!this.checkValidTerm(prelwat)) {
      postlwat = await this.getAccessToken();
      await this.updateAccessToken(postlwat);
    } else {
      postlwat = prelwat;
      await this.updateAccessToken(prelwat);
    }
    return postlwat.accessToken;
  };
}
