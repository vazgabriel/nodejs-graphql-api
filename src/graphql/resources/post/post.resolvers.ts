import { handleError } from './../../../utils/utils';

import { Transaction } from 'sequelize';
import { GraphQLResolveInfo } from 'graphql';

import { DbConnection } from './../../../interfaces/DbConnectionInterface';
import { PostInstance } from '../../../models/PostModel';

export const postResolvers = {

  Post: {

    author: (post, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      return db.User
        .findById(post.get('author'))
        .catch(handleError);
    },

    comments: (post, { first = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      return db.Comment
        .findAll({
          where: {
            post: post.get('id')
          },
          limit: first,
          offset
        })
        .catch(handleError);
    }

  },

  Query: {

    posts: (post, { first = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      return db.Post
        .findAll({
          limit: first,
          offset
        })
        .catch(handleError);
    },

    post: (post, { id }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.Post
        .findById(id)
        .then((post: PostInstance) => {
          if (!post) throw new Error(`Post with id ${id} not found!`);
          return post;
        })
        .catch(handleError);
    }

  },

  Mutation: {

    createPost: (post, { input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.Post
          .create(input, {
            transaction
          });
      })
        .catch(handleError);
    },

    updatePost: (post, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.Post
          .findById(id)
          .then((post: PostInstance) => {
            if (!post) throw new Error(`Post with id ${id} not found!`);
            return post.update(input, {
              transaction
            });
          });
      })
        .catch(handleError);
    },

    deletePost: (post, { id }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.Post
          .findById(id)
          .then((post: PostInstance) => {
            if (!post) throw new Error(`Post with id ${id} not found!`);
            return post.destroy({
              transaction
            })
              .then(post => !!post);
          });
      })
        .catch(handleError);
    }

  }

};