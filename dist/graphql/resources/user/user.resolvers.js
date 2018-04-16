"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./../../../utils/utils");
exports.userResolvers = {
    User: {
        posts: (user, { first = 10, offset = 0 }, { db }, info) => {
            return db.Post
                .findAll({
                where: {
                    author: user.get('id')
                },
                limit: first,
                offset: offset
            }).catch(utils_1.handleError);
        }
    },
    Query: {
        users: (user, { first = 10, offset = 0 }, { db }, info) => {
            return db.User
                .findAll({
                limit: first,
                offset: offset
            }).catch(utils_1.handleError);
        },
        user: (user, { id }, { db }, info) => {
            id = parseInt(id);
            return db.User
                .findById(id)
                .then((user) => {
                if (!user)
                    throw new Error(`User with id ${id} not found!`);
                return user;
            }).catch(utils_1.handleError);
        }
    },
    Mutation: {
        createUser: (user, { input }, { db }, info) => {
            return db.sequelize.transaction((transaction) => {
                return db.User
                    .create(input, {
                    transaction
                });
            }).catch(utils_1.handleError);
        },
        updateUser: (user, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((transaction) => {
                return db.User
                    .findById(id)
                    .then((user) => {
                    if (!user)
                        throw new Error(`User with id ${id} not found!`);
                    return user.update(input, {
                        transaction
                    });
                });
            }).catch(utils_1.handleError);
        },
        updateUserPassword: (user, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((transaction) => {
                return db.User
                    .findById(id)
                    .then((user) => {
                    if (!user)
                        throw new Error(`User with id ${id} not found!`);
                    return user.update(input, {
                        transaction
                    })
                        .then((user) => !!user);
                });
            }).catch(utils_1.handleError);
        },
        deleteUser: (user, { id }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((transaction) => {
                return db.User
                    .findById(id)
                    .then((user) => {
                    if (!user)
                        throw new Error(`User with id ${id} not found!`);
                    return user.destroy({
                        transaction
                    })
                        .then(user => !!user);
                });
            }).catch(utils_1.handleError);
        }
    }
};
