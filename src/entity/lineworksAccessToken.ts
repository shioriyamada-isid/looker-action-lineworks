/* eslint-disable camelcase */
import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export default class lineworksAccessToken {
  @PrimaryColumn()
  public id: string = 'LINE_WORKS_ACCESS_TOKEN';

  @Column()
  public accessToken: string = '';

  @Column()
  public tokenType: string = '';

  @Column()
  public expires_in: number = 0;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 0 })
  public createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', precision: 0 })
  public updatedAt?: Date;
}
