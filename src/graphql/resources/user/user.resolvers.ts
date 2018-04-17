import { ResolverContext } from './../../../interfaces/ResolverContextInterface';
import { authResolvers } from './../../composable/auth.resolver';
import { compose } from '../../composable/composable.resolver';

import { handleError, throwError } from './../../../utils/utils';

import { AuthUser } from './../../../interfaces/AuthUserInterface';
import { DbConnection } from './../../../interfaces/DbConnectionInterface';
import { UserInstance } from '../../../models/UserModel';
import { RequestedFields } from './../../ast/RequestedFields';

import { GraphQLResolveInfo } from "graphql";
import { Transaction } from 'sequelize';

export const userResolvers = {

  User: {

    posts: (user, { first = 10, offset = 0 }, { db, requestedFields }: { db: DbConnection, requestedFields: RequestedFields }, info: GraphQLResolveInfo) => {
      return db.Post
        .findAll({
          where: {
            author: user.get('id')
          },
          limit: first,
          offset: offset,
          attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
        }).catch(handleError);
    }

  },

  Query: {

    users: (user, { first = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
      return context.db.User
        .findAll({
          limit: first,
          offset: offset,
          attributes: context.requestedFields.getFields(info, {
            keep: ['id'],
            exclude: ['posts']
          })
        }).catch(handleError);
    },

    user: (user, { id }, context: ResolverContext, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return context.db.User
        .findById(id, {
          attributes: context.requestedFields.getFields(info, {
            keep: ['id'],
            exclude: ['posts']
          })
        })
        .then((user: UserInstance) => {
          throwError(!user, `User with id ${id} not found!`)
          return user;
        }).catch(handleError);
    },

    currentUser: compose(...authResolvers)((user, args, context: ResolverContext, info: GraphQLResolveInfo) => {
      return context.db.User
        .findById(context.authUser.id, {
          attributes: context.requestedFields.getFields(info, {
            keep: ['id'],
            exclude: ['posts']
          })
        })
        .then((user: UserInstance) => {
          throwError(!user, `User with id ${context.authUser.id} not found!`)
          return user;
        }).catch(handleError);
    })

  },

  Mutation: {

    createUser: (user, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.User
          .create(input, {
            transaction
          });
      }).catch(handleError);
    },

    updateUser: compose(...authResolvers)((user, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.User
          .findById(authUser.id)
          .then((user: UserInstance) => {
            throwError(!user, `User with id ${authUser.id} not found!`)
            return user.update(input, {
              transaction
            });
          });
      }).catch(handleError);
    }),

    updateUserPassword: compose(...authResolvers)((user, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.User
          .findById(authUser.id)
          .then((user: UserInstance) => {
            throwError(!user, `User with id ${authUser.id} not found!`)
            return user.update(input, {
              transaction
            })
              .then((user: UserInstance) => !!user);
          });
      }).catch(handleError);
    }),

    deleteUser: compose(...authResolvers)((user, args, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.User
          .findById(authUser.id)
          .then((user: UserInstance) => {
            throwError(!user, `User with id ${authUser.id} not found!`)
            return user.destroy({
              transaction
            })
              .then(user => !!user);
          });
      }).catch(handleError);
    })

  }

};