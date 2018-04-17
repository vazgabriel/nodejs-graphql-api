import { AuthUser } from './AuthUserInterface';
import { DataLoadersInterface } from './DataLoadersInterface';
import { DbConnection } from './DbConnectionInterface';
import { RequestedFields } from './../graphql/ast/RequestedFields';

export interface ResolverContext {

  db?: DbConnection;
  authorization?: string;
  authUser?: AuthUser;
  dataloaders?: DataLoadersInterface;
  requestedFields?: RequestedFields

};