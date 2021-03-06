import * as graphqlFields from 'graphql-fields';

import { AuthUser } from './../../../interfaces/AuthUserInterface';
import { handleError, throwError } from './../../../utils/utils';

import { Transaction } from 'sequelize';
import { GraphQLResolveInfo } from 'graphql';

import { DataLoadersInterface } from './../../../interfaces/DataLoadersInterface';
import { DbConnection } from './../../../interfaces/DbConnectionInterface';

import { authResolvers } from './../../composable/auth.resolver';
import { compose } from '../../composable/composable.resolver';
import { PostInstance } from '../../../models/PostModel';
import { ResolverContext } from '../../../interfaces/ResolverContextInterface';

export const postResolvers = {

  Post: {

    author: (post, args, { db, dataloaders: { userLoader } }: { db: DbConnection, dataloaders: DataLoadersInterface }, info: GraphQLResolveInfo) => {
      return userLoader
        .load({ key: post.get('author'), info })
        .catch(handleError);
    },

    comments: (post, { first = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
      return context.db.Comment
        .findAll({
          where: {
            post: post.get('id')
          },
          limit: first,
          offset,
          attributes: context.requestedFields.getFields(info)
        })
        .catch(handleError);
    }

  },

  Query: {

    posts: (post, { first = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
      return context.db.Post
        .findAll({
          limit: first,
          offset,
          attributes: context.requestedFields.getFields(info, {
            keep: ['id'],
            exclude: ['comments']
          })
        })
        .catch(handleError);
    },

    post: (post, { id }, context: ResolverContext, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return context.db.Post
        .findById(id, {
          attributes: context.requestedFields.getFields(info, {
            keep: ['id'],
            exclude: ['comments']
          })
        })
        .then((post: PostInstance) => {
          throwError(!post, `Post with id ${id} not found!`);
          return post;
        })
        .catch(handleError);
    }

  },

  Mutation: {

    createPost: compose(...authResolvers)((post, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
      input.author = authUser.id;
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.Post
          .create(input, {
            transaction
          });
      })
        .catch(handleError);
    }),

    updatePost: compose(...authResolvers)((post, { id, input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.Post
          .findById(id)
          .then((post: PostInstance) => {
            throwError(!post, `Post with id ${id} not found!`);
            throwError(post.get('author') != authUser.id, `Unauthorized! You can only edit posts by yourself!`);
            input.author = authUser.id;
            return post.update(input, {
              transaction
            });
          });
      })
        .catch(handleError);
    }),

    deletePost: compose(...authResolvers)((post, { id }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.Post
          .findById(id)
          .then((post: PostInstance) => {
            throwError(!post, `Post with id ${id} not found!`);
            throwError(post.get('author') != authUser.id, `Unauthorized! You can only delete posts by yourself!`);
            return post.destroy({
              transaction
            })
              .then(post => !!post);
          });
      })
        .catch(handleError);
    })

  }

};