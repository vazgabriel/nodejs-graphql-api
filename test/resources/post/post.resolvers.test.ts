import { JWT_SECRET } from './../../../src/utils/utils';
import * as jwt from 'jsonwebtoken';

import { PostInstance } from './../../../src/models/PostModel';
import { UserInstance } from './../../../src/models/UserModel';
import { app, db, chai, handleError, expect } from '../../test-utils';

describe('Post', () => {

  let token: string;
  let userId: number;
  let postId: number;

  beforeEach(() => {

    return db.Comment.destroy({ where: {} })
      .then((rows: number) => db.Post.destroy({ where: {} }))
      .then((rows: number) => db.User.destroy({ where: {} }))
      .then((rows: number) => db.User.create({
        name: 'Gabriel Tester',
        email: 'gabrieltester@email.com',
        password: '123456'
      }
      )).then((user: UserInstance) => {
        userId = user.get('id');
        const payload = { sub: userId };
        token = jwt.sign(payload, JWT_SECRET);

        return db.Post.bulkCreate([
          {
            title: 'First Post',
            content: 'First Post',
            author: userId,
            photo: "some_photo"
          },
          {
            title: 'Second Post',
            content: 'Second Post',
            author: userId,
            photo: "some_photo"
          },
          {
            title: 'Third Post',
            content: 'Third Post',
            author: userId,
            photo: "some_photo"
          }
        ]);
      }).then((posts: PostInstance[]) => {

        postId = posts[0].get('id');

      });

  });

  describe('Queries', () => {

    describe('application/json', () => {

      describe('posts', () => {

        it('should return a list of Posts', () => {

          let body = {
            query: `
              query {
                posts {
                  title
                  author {
                    name
                  }
                }
              }
            `
          };

          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {

              const postList = res.body.data.posts;
              expect(postList).to.be.an('array');
              expect(postList[0]).to.be.an('object');
              expect(postList[0].title).be.equal('First Post');
              expect(postList[0].author.name).be.equal('Gabriel Tester');
              expect(postList[0]).to.have.keys(['title', 'author']);
              expect(postList[0]).to.not.have.keys(['content', 'createdAt', 'updatedAt']);
              expect(postList).length(3);

            }).catch(handleError)

        });

      });

      describe('post', () => {

        it('should return an existing Posts', () => {

          let body = {
            query: `
              query getPost($id: ID!) {
                post(id: $id) {
                  title
                  content
                  comments {
                    comment
                  }
                }
              }
            `,
            variables: {
              id: postId
            }
          };

          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {

              const post = res.body.data.post;
              expect(post).to.have.keys(['title', 'content', 'comments']);
              expect(post).to.not.have.keys(['author', 'createdAt', 'updatedAt']);
              expect(post.title).to.not.be.null;
              expect(post.content).to.not.be.null;
              expect(post.comments).to.be.an('array');

            }).catch(handleError)

        });

      });

    });

    describe('application/graphql', () => {

      describe('posts', () => {

        it('should return a list of Posts', () => {

          let body = `
            query {
              posts {
                title
                author {
                  name
                }
              }
            }
          `;

          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/graphql')
            .send(body)
            .then(res => {

              const postList = res.body.data.posts;
              expect(postList).to.be.an('array');
              expect(postList[0]).to.be.an('object');
              expect(postList[0].title).be.equal('First Post');
              expect(postList[0].author.name).be.equal('Gabriel Tester');
              expect(postList[0]).to.have.keys(['title', 'author']);
              expect(postList[0]).to.not.have.keys(['content', 'createdAt', 'updatedAt']);
              expect(postList).length(3);

            }).catch(handleError)

        });

        it('should paginate a list of Posts', () => {

          let body = `
            query getPosts($first: Int, $offset: Int) {
              posts(first: $first, offset: $offset) {
                title
                author {
                  name
                }
              }
            }
          `;

          // https.../graphql?variables={...}

          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/graphql')
            .send(body)
            .query({
              variables: JSON.stringify({
                first: 2,
                offset: 1
              })
            })
            .then(res => {

              const postList = res.body.data.posts;
              expect(postList).to.be.an('array');
              expect(postList[0]).to.be.an('object');
              expect(postList[0].title).be.equal('Second Post');
              expect(postList[0].author.name).be.equal('Gabriel Tester');
              expect(postList[0]).to.have.keys(['title', 'author']);
              expect(postList[0]).to.not.have.keys(['content', 'createdAt', 'updatedAt']);
              expect(postList).length(2);

            }).catch(handleError)

        });

      });

    });

  });

});