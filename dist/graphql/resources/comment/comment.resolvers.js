"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_resolver_1 = require("./../../composable/auth.resolver");
const composable_resolver_1 = require("../../composable/composable.resolver");
const utils_1 = require("../../../utils/utils");
exports.commentResolvers = {
    Comment: {
        user: (comment, args, { db }, info) => {
            return db.User
                .findById(comment.get('user'))
                .catch(utils_1.handleError);
        },
        post: (comment, args, { db }, info) => {
            return db.Post
                .findById(comment.get('post'))
                .catch(utils_1.handleError);
        }
    },
    Query: {
        commentsByPost: (comment, { postId, first = 10, offset = 0 }, { db }, info) => {
            postId = parseInt(postId);
            return db.Comment
                .findAll({
                where: {
                    post: postId
                },
                limit: first,
                offset
            }).catch(utils_1.handleError);
        }
    },
    Mutation: {
        createComment: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((comment, { input }, { db, authUser }, info) => {
            return db.sequelize.transaction((transaction) => {
                return db.Comment
                    .create(input, {
                    transaction
                });
            }).catch(utils_1.handleError);
        }),
        updateComment: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((comment, { id, input }, { db, authUser }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment) => {
                    utils_1.throwError(!comment, `Comment with id ${id} not found!`);
                    utils_1.throwError(comment.get('user') != authUser.id, `Unauthorized! You can only edit comments by yourself!`);
                    return comment.update(input, {
                        transaction
                    });
                });
            }).catch(utils_1.handleError);
        }),
        deleteComment: composable_resolver_1.compose(...auth_resolver_1.authResolvers)((comment, { id }, { db, authUser }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment) => {
                    utils_1.throwError(!comment, `Comment with id ${id} not found!`);
                    utils_1.throwError(comment.get('user') != authUser.id, `Unauthorized! You can only delete comments by yourself!`);
                    return comment.destroy({
                        transaction
                    })
                        .then(comment => !!comment);
                });
            }).catch(utils_1.handleError);
        })
    }
};
