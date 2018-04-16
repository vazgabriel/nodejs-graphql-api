import { CommentInstance } from './../../../models/CommentModel';
import { DbConnection } from './../../../interfaces/DbConnectionInterface';

import { GraphQLResolveInfo } from 'graphql';
import { Transaction } from 'sequelize';

import { handleError } from '../../../utils/utils';

export const commentResolvers = {

  Comment: {

    user: (comment, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      return db.User
        .findById(comment.get('user'))
        .catch(handleError);
    },

    post: (comment, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      return db.Post
        .findById(comment.get('post'))
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
        })
        .catch(handleError);
    }

  },

  Mutation: {

    createComment: (comment, { input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.Comment
          .create(input, {
            transaction
          });
      })
        .catch(handleError);
    },

    updateComment: (comment, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.Comment
          .findById(id)
          .then((comment: CommentInstance) => {
            if (!comment) throw new Error(`Comment with id ${id} not found!`);
            return comment.update(input, {
              transaction
            });
          });
      })
        .catch(handleError);
    },

    deleteComment: (comment, { id }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.Comment
          .findById(id)
          .then((comment: CommentInstance) => {
            if (!comment) throw new Error(`Comment with id ${id} not found!`);
            return comment.destroy({
              transaction
            })
              .then(comment => !!comment);
          });
      })
        .catch(handleError);
    }

  }

};