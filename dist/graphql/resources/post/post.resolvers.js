"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./../../../utils/utils");
const auth_resolver_1 = require("./../../composable/auth.resolver");
const composable_resolver_1 = require("../../composable/composable.resolver");
exports.postResolvers = {
    Post: {
        author: (post, args, { db, dataloaders: { userLoader } }, info) => {
            return userLoader
                .load({ key: post.get('author'), info })
                .catch(utils_1.handleError);
        },
        comments: (post, { first = 10, offset = 0 }, context, info) => {
            return context.db.Comment
                .findAll({
                where: {
                    post: post.get('id')
                },
                limit: first,
                offset,
                attributes: context.requestedFields.getFields(info)
            })
                .catch(utils_1.handleError);
        }
    },
    Query: {
        posts: (post, { first = 10, offset = 0 }, context, info) => {
            return context.db.Post
                .findAll({
                limit: first,
                offset,
                attributes: context.requestedFields.getFields(info, {
                    keep: ['id'],
                    exclude: ['comments']
                })
            })
                .catch(utils_1.handleError);
        },
        post: (post, { id }, context, info) => {
            id = parseInt(id);
            return context.db.Post
                .findById(id, {
                attributes: context.requestedFields.getFields(info, {
                    keep: ['id'],
                    exclude: ['comments']
                })
            })
                .then((post) => {
                utils_1.throwError(!post, `Post with id ${id} not found!`);
                return post;
            })
                .catch(utils_1.handleError);
        }
    },
    Mutation: {
        createPost: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((post, { input }, { db, authUser }, info) => {
            input.author = authUser.id;
            return db.sequelize.transaction((transaction) => {
                return db.Post
                    .create(input, {
                    transaction
                });
            })
                .catch(utils_1.handleError);
        }),
        updatePost: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((post, { id, input }, { db, authUser }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((transaction) => {
                return db.Post
                    .findById(id)
                    .then((post) => {
                    utils_1.throwError(!post, `Post with id ${id} not found!`);
                    utils_1.throwError(post.get('author') != authUser.id, `Unauthorized! You can only edit posts by yourself!`);
                    input.author = authUser.id;
                    return post.update(input, {
                        transaction
                    });
                });
            })
                .catch(utils_1.handleError);
        }),
        deletePost: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((post, { id }, { db, authUser }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((transaction) => {
                return db.Post
                    .findById(id)
                    .then((post) => {
                    utils_1.throwError(!post, `Post with id ${id} not found!`);
                    utils_1.throwError(post.get('author') != authUser.id, `Unauthorized! You can only delete posts by yourself!`);
                    return post.destroy({
                        transaction
                    })
                        .then(post => !!post);
                });
            })
                .catch(utils_1.handleError);
        })
    }
};
