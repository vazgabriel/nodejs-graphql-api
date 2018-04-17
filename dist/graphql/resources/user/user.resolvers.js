"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_resolver_1 = require("./../../composable/auth.resolver");
const composable_resolver_1 = require("../../composable/composable.resolver");
const utils_1 = require("./../../../utils/utils");
exports.userResolvers = {
    User: {
        posts: (user, { first = 10, offset = 0 }, { db, requestedFields }, info) => {
            return db.Post
                .findAll({
                where: {
                    author: user.get('id')
                },
                limit: first,
                offset: offset,
                attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
            }).catch(utils_1.handleError);
        }
    },
    Query: {
        users: (user, { first = 10, offset = 0 }, context, info) => {
            return context.db.User
                .findAll({
                limit: first,
                offset: offset,
                attributes: context.requestedFields.getFields(info, {
                    keep: ['id'],
                    exclude: ['posts']
                })
            }).catch(utils_1.handleError);
        },
        user: (user, { id }, context, info) => {
            id = parseInt(id);
            return context.db.User
                .findById(id, {
                attributes: context.requestedFields.getFields(info, {
                    keep: ['id'],
                    exclude: ['posts']
                })
            })
                .then((user) => {
                utils_1.throwError(!user, `User with id ${id} not found!`);
                return user;
            }).catch(utils_1.handleError);
        },
        currentUser: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((user, args, context, info) => {
            return context.db.User
                .findById(context.authUser.id, {
                attributes: context.requestedFields.getFields(info, {
                    keep: ['id'],
                    exclude: ['posts']
                })
            })
                .then((user) => {
                utils_1.throwError(!user, `User with id ${context.authUser.id} not found!`);
                return user;
            }).catch(utils_1.handleError);
        })
    },
    Mutation: {
        createUser: (user, { input }, { db, authUser }, info) => {
            return db.sequelize.transaction((transaction) => {
                return db.User
                    .create(input, {
                    transaction
                });
            }).catch(utils_1.handleError);
        },
        updateUser: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((user, { input }, { db, authUser }, info) => {
            return db.sequelize.transaction((transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user) => {
                    utils_1.throwError(!user, `User with id ${authUser.id} not found!`);
                    return user.update(input, {
                        transaction
                    });
                });
            }).catch(utils_1.handleError);
        }),
        updateUserPassword: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((user, { input }, { db, authUser }, info) => {
            return db.sequelize.transaction((transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user) => {
                    utils_1.throwError(!user, `User with id ${authUser.id} not found!`);
                    return user.update(input, {
                        transaction
                    })
                        .then((user) => !!user);
                });
            }).catch(utils_1.handleError);
        }),
        deleteUser: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((user, args, { db, authUser }, info) => {
            return db.sequelize.transaction((transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user) => {
                    utils_1.throwError(!user, `User with id ${authUser.id} not found!`);
                    return user.destroy({
                        transaction
                    })
                        .then(user => !!user);
                });
            }).catch(utils_1.handleError);
        })
    }
};
