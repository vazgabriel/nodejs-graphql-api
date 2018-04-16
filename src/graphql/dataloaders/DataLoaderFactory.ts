import * as DataLoader from 'dataloader';

import { PostLoader } from './PostLoader';
import { UserLoader } from './UserLoader';

import { PostInstance } from './../../models/PostModel';
import { UserInstance } from './../../models/UserModel';

import { DataLoadersInterface } from './../../interfaces/DataLoadersInterface';
import { DbConnection } from './../../interfaces/DbConnectionInterface';

export class DataLoaderFactory {

  constructor(
    private db: DbConnection
  ) { }

  getLoaders(): DataLoadersInterface {
    return {
      userLoader: new DataLoader<number, UserInstance>(
        (ids: number[]) => UserLoader.batchUsers(this.db.User, ids)
      ),
      postLoader: new DataLoader<number, PostInstance>(
        (ids: number[]) => PostLoader.batchPosts(this.db.Post, ids)
      )
    };
  }

}