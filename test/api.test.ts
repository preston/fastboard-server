// Author: Preston Lee

const request = require('supertest');
import app from '../src/api';

describe('GET /', () => {

    test('it should return a JSON status document', done => {
        request(app)
            .get('/')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect((res: any) => {
                if (!res.body.message) {
                    throw new Error("Document didn't include expected properties");
                }
                if (res.body.datetime <= 0) {
                    throw new Error("Timestamp field 'datetime' not present");
                }
            })
            .expect(200, done);
    });

});

describe('GET /dashboards', () => {

    test('it should not choke or query parameters', done => {
        request(app)
            .get('/dashboards?foo=bar&type=valid&crap=null&junk=nil&bad=undefined')
            .expect(200, done);
    });

    test('it should contain at least one dashboard declaration', done => {
        request(app)
            .get('/dashboards')
            .expect((res: any) => {
                // console.log(res.body);
                if (res.body.dashboards.length == 0) {
                    throw new Error("No dashboard provided!");
                } else {
                    for (let n = 0; n < res.body.dashboards.length; n++) {
                        let r = res.body.dashboards[n];
                        if (!r.hook || !r.description || !r.id || !r.title) {
                            throw new Error("Missing FHIR resource property!");
                        }
                    }
                }
            })
            .expect(200, done);
    });

});

describe('POST /dashboards/:id', () => {

    test('it should not accept invalid JSON', done => {
        request(app)
            .post('/dashboards/test')
            .send('something clearly not going to parse as JSON')
            .expect((res: any) => {
                // console.log(res.aoeu);
            })
            .expect(400, done);
    });

    test('it should accept a valid document', done => {
        // FIXEM Primary test case.
        let data = {};
        request(app)
            .post('/dashboards/test-valid-data')
            .send(data)
            .expect(200, done)
            // .done();
    });

});
