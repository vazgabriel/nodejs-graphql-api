import { DataLoadersInterface } from './DataLoadersInterface';
import { AuthUser } from './AuthUserInterface';
import { DbConnection } from './DbConnectionInterface';

export interface ResolverContext {

  db?: DbConnection;
  authorization?: string;
  authUser?: AuthUser;
  dataloaders?: DataLoadersInterface;

};