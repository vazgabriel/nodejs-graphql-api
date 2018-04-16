"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./../../../utils/utils");
exports.postResolvers = {
    Post: {
        author: (post, args, { db }, info) => {
            return db.User
                .findById(post.get('author'))
                .catch(utils_1.handleError);
        },
        comments: (post, { first = 10, offset = 0 }, { db }, info) => {
            return db.Comment
                .findAll({
                where: {
                    post: post.get('id')
                },
                limit: first,
                offset
            })
                .catch(utils_1.handleError);
        }
    },
    Query: {
        posts: (post, { first = 10, offset = 0 }, { db }, info) => {
            return db.Post
                .findAll({
                limit: first,
                offset
            })
                .catch(utils_1.handleError);
        },
        post: (post, { id }, { db }, info) => {
            id = parseInt(id);
            return db.Post
                .findById(id)
                .then((post) => {
                if (!post)
                    throw new Error(`Post with id ${id} not found!`);
                return post;
            })
                .catch(utils_1.handleError);
        }
    },
    Mutation: {
        createPost: (post, { input }, { db }, info) => {
            return db.sequelize.transaction((transaction) => {
                return db.Post
                    .create(input, {
                    transaction
                });
            })
                .catch(utils_1.handleError);
        },
        updatePost: (post, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((transaction) => {
                return db.Post
                    .findById(id)
                    .then((post) => {
                    if (!post)
                        throw new Error(`Post with id ${id} not found!`);
                    return post.update(input, {
                        transaction
                    });
                });
            })
                .catch(utils_1.handleError);
        },
        deletePost: (post, { id }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((transaction) => {
                return db.Post
                    .findById(id)
                    .then((post) => {
                    if (!post)
                        throw new Error(`Post with id ${id} not found!`);
                    return post.destroy({
                        transaction
                    })
                        .then(post => !!post);
                });
            })
                .catch(utils_1.handleError);
        }
    }
};
