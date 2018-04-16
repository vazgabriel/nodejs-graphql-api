import { AuthUser } from './../../../interfaces/AuthUserInterface';
import { CommentInstance } from './../../../models/CommentModel';
import { DataLoadersInterface } from './../../../interfaces/DataLoadersInterface';
import { DbConnection } from './../../../interfaces/DbConnectionInterface';

import { GraphQLResolveInfo } from 'graphql';
import { Transaction } from 'sequelize';

import { authResolvers } from './../../composable/auth.resolver';
import { compose } from '../../composable/composable.resolver';
import { handleError, throwError } from '../../../utils/utils';

export const commentResolvers = {

  Comment: {

    user: (comment, args, { db, dataloaders: {userLoader} }: { db: DbConnection, dataloaders: DataLoadersInterface }, info: GraphQLResolveInfo) => {
      return userLoader
        .load(comment.get('user'))
        .catch(handleError);
    },

    post: (comment, args, { db, dataloaders: {postLoader} }: { db: DbConnection, dataloaders: DataLoadersInterface }, info: GraphQLResolveInfo) => {
      return postLoader
        .load(comment.get('post'))
        .catch(handleError);
    }

  },

  Query: {

    commentsByPost: (comment, { postId, first = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      postId = parseInt(postId);
      return db.Comment
        .findAll({
          where: {
            post: postId
          },
          limit: first,
          offset
        }).catch(handleError);
    }

  },

  Mutation: {

    createComment: compose(...authResolvers)((comment, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.Comment
          .create(input, {
            transaction
          });
      }).catch(handleError);
    }),

    updateComment: compose(...authResolvers)((comment, { id, input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.Comment
          .findById(id)
          .then((comment: CommentInstance) => {
            throwError(!comment, `Comment with id ${id} not found!`);
            throwError(comment.get('user') != authUser.id, `Unauthorized! You can only edit comments by yourself!`);
            return comment.update(input, {
              transaction
            });
          });
      }).catch(handleError);
    }),

    deleteComment: compose(...authResolvers)((comment, { id }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.Comment
          .findById(id)
          .then((comment: CommentInstance) => {
            throwError(!comment, `Comment with id ${id} not found!`);
            throwError(comment.get('user') != authUser.id, `Unauthorized! You can only delete comments by yourself!`);
            return comment.destroy({
              transaction
            })
              .then(comment => !!comment);
          });
      }).catch(handleError);
    })

  }

};