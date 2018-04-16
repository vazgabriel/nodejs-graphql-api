import { handleError } from './../../../utils/utils';

import { DbConnection } from './../../../interfaces/DbConnectionInterface';
import { UserInstance } from '../../../models/UserModel';

import { GraphQLResolveInfo } from "graphql";
import { Transaction } from 'sequelize';

export const userResolvers = {

  User: {

    posts: (user, { first = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      return db.Post
        .findAll({
          where: {
            author: user.get('id')
          },
          limit: first,
          offset: offset
        }).catch(handleError);
    }

  },

  Query: {

    users: (user, { first = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      return db.User
        .findAll({
          limit: first,
          offset: offset
        }).catch(handleError);
    },

    user: (user, { id }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.User
        .findById(id)
        .then((user: UserInstance) => {
          if (!user) throw new Error(`User with id ${id} not found!`);
          return user;
        }).catch(handleError);
    }

  },

  Mutation: {

    createUser: (user, { input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.User
          .create(input, {
            transaction
          });
      }).catch(handleError);
    },

    updateUser: (user, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.User
          .findById(id)
          .then((user: UserInstance) => {
            if (!user) throw new Error(`User with id ${id} not found!`);
            return user.update(input, {
              transaction
            });
          });
      }).catch(handleError);
    },

    updateUserPassword: (user, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.User
          .findById(id)
          .then((user: UserInstance) => {
            if (!user) throw new Error(`User with id ${id} not found!`);
            return user.update(input, {
              transaction
            })
              .then((user: UserInstance) => !!user);
          });
      }).catch(handleError);
    },

    deleteUser: (user, { id }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
      id = parseInt(id);
      return db.sequelize.transaction((transaction: Transaction) => {
        return db.User
          .findById(id)
          .then((user: UserInstance) => {
            if (!user) throw new Error(`User with id ${id} not found!`);
            return user.destroy({
              transaction
            })
              .then(user => !!user);
          });
      }).catch(handleError);
    }

  }

};