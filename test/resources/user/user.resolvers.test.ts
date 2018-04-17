import { UserInstance } from './../../../src/models/UserModel';
import { app, db, chai, handleError, expect } from '../../test-utils';

describe('User', () => {

  let userId: number;

  beforeEach(() => {

    return db.Comment.destroy({ where: {} })
      .then((rows: number) => db.Post.destroy({ where: {} }))
      .then((rows: number) => db.User.destroy({ where: {} }))
      .then((rows: number) => db.User.bulkCreate(
        [{
          name: 'Gabriel Tester',
          email: 'gabrieltester@email.com',
          password: '123456'
        }, {
          name: 'Teste Tester',
          email: 'testetester@email.com',
          password: '123456'
        }, {
          name: 'Gabriel Hasquer',
          email: 'gabrielhasquer@email.com',
          password: '123456'
        }]
      )).then((users: UserInstance[]) => {
        userId = users[0].get('id');
      });

  });

  describe('Queries', () => {

    describe('application/json', () => {

      describe('users', () => {

        it('should return a list of Users', () => {

          let body = {
            query: `
              query {
                users {
                  name
                  email
                }
              }
            `
          };

          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {

              const userList = res.body.data.users;
              expect(res.body.data).to.be.an('object');
              expect(userList[0]).to.not.have.keys([
                'id',
                'photo',
                'createdAt',
                'updatedAt',
                'posts'
              ]);
              expect(userList[0]).to.have.keys(['name', 'email']);

            }).catch(handleError)

        });

        it('should paginate a list of Users', () => {

          let body = {
            query: `
              query getUsersList($first: Int, $offset: Int) {
                users(first: $first, offset: $offset) {
                  name
                  email
                  createdAt
                }
              }
            `,
            variables: {
              first: 2,
              offset: 1
            }
          };

          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {

              const userList = res.body.data.users;
              expect(res.body.data).to.be.an('object');
              expect(userList).to.be.an('array').of.length(2);
              expect(userList[0]).to.not.have.keys([
                'id',
                'photo',
                'updatedAt',
                'posts'
              ]);
              expect(userList[0]).to.have.keys(['name', 'email', 'createdAt']);


            }).catch(handleError)

        });

      });

      describe('user', () => {


        it('should return a single User', () => {

          let body = {
            query: `
              query getSingleUser($id: ID!) {
                user(id: $id) {
                  name
                  email
                }
              }
            `,
            variables: {
              id: userId
            }
          };

          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {

              const singleUser = res.body.data.user;
              expect(res.body.data).to.be.an('object');
              expect(singleUser).to.be.an('object');
              expect(singleUser).to.not.have.keys([
                'id',
                'photo',
                'createdAt',
                'updatedAt',
                'posts'
              ]);
              expect(singleUser).to.have.keys(['name', 'email']);
              expect(singleUser.name).to.equal('Gabriel Tester');

            }).catch(handleError);

        });

        it('should return only \'name\' attribute', () => {

          let body = {
            query: `
              query getSingleUser($id: ID!) {
                user(id: $id) {
                  name
                }
              }
            `,
            variables: {
              id: userId
            }
          };

          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {

              const singleUser = res.body.data.user;
              expect(res.body.data).to.be.an('object');
              expect(singleUser).to.be.an('object');
              expect(singleUser).to.not.have.keys([
                'id',
                'email',
                'photo',
                'createdAt',
                'updatedAt',
                'posts'
              ]);
              expect(singleUser).to.have.key('name');
              expect(singleUser.name).to.equal('Gabriel Tester');

            }).catch(handleError);

        });

        it('should return an error if user not exists', () => {

          let body = {
            query: `
              query getSingleUser($id: ID!) {
                user(id: $id) {
                  name
                  email
                }
              }
            `,
            variables: {
              id: -1
            }
          };

          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {

              expect(res.body.data.user).to.be.null;
              expect(res.body.errors).to.be.an('array');
              expect(res.body).to.have.keys(['data', 'errors']);
              expect(res.body.errors[0].message).to.equal('Error: User with id -1 not found!');

            }).catch(handleError);

        });
      });

    });

  });

});