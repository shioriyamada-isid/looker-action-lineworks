import fetch from 'node-fetch';
import * as jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import LineworksAccessToken from '../entity/lineworksAccessToken';
import { URLSearchParams } from 'url';

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

  private async getAccessToken(): Promise<LineworksAccessToken> {
    const form = new URLSearchParams();
    form.append('grant_type', 'urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer');
    form.append('assertion', this.getJwt());
    const options = {
      method: 'POST',
      body: form,
    };
    const rowResponse = await fetch(this.tokenUrl, options);
    const jsonResponse = await rowResponse.json();
    console.log(rowResponse);
    console.log(jsonResponse);
    const accessToken: LineworksAccessToken = new LineworksAccessToken();
    accessToken.accessToken = jsonResponse.access_token;
    accessToken.tokenType = jsonResponse.token_type;
    accessToken.expires_in = jsonResponse.expires_in;
    return accessToken;
  }

  /**
   *
   * @param lineworksAccessToken
   * @description 有効だったらtrue 無効だったらfalse
   */
  private checkValidTerm = (lineworksAccessToken: LineworksAccessToken): boolean => {
    const now: number = Date.now();
    if (lineworksAccessToken.updatedAt === undefined) return false;
    const timediff = lineworksAccessToken.updatedAt.getTime() + lineworksAccessToken.expires_in * 1000 - now;
    if (timediff > 0) {
      return true;
    } else {
      return false;
    }
  };

  private createAccessToken = async (accessToken: LineworksAccessToken) => {
    return await this.repository.insert(accessToken);
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
    const prelwat = await this.readAccessToken();
    let postlwat = new LineworksAccessToken();
    // 取得できない、または、期限が切れている場合、新たに取得してDBをセット
    // 期限が有効な場合、updatedAtを更新して終了
    console.log(prelwat);
    if (prelwat === undefined) {
      postlwat = await this.getAccessToken();
      await this.createAccessToken(postlwat);
    } else {
      if (!this.checkValidTerm(prelwat)) {
        postlwat = await this.getAccessToken();
      } else {
        postlwat = prelwat;
        postlwat.id = 'LINE_WORKS_ACCESS_TOKEN';
      }
      await this.updateAccessToken(postlwat);
    }
    console.log(postlwat);
    return postlwat.accessToken;
  };
}
