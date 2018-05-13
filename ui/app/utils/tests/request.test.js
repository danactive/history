/**
 * Test the request function
 */

import request from '../request';

describe('request with response', () => {
  // Before each test, stub the fetch function
  beforeEach(() => {
    window.fetch = jest.fn();
  });

  describe('stubbing 204 No Content response', () => {
    // Before each test, pretend we got a successful response
    beforeEach(() => {
      const res = new Response('', {
        status: 204,
        statusText: 'No Content',
      });

      window.fetch.mockReturnValue(Promise.resolve(res));
    });

    it('should return null on 204 response', (done) => {
      request('/url')
        .catch((err) => expect(err).toBeUndefined() && done())
        .then((json) => {
          expect(json).toBeNull();
          done();
        });
    });
  });

  describe('stubbing 404 error response', () => {
    // Before each test, pretend we got an unsuccessful response
    beforeEach(() => {
      const res = new Response('', {
        status: 404,
        statusText: 'Not Found',
      });

      window.fetch.mockReturnValue(Promise.resolve(res));
    });

    it('should catch errors', (done) => {
      request('/url')
        .then((response) => expect(response).toBeUndefined() && done())
        .catch((err) => {
          expect(err.response.status).toBe(404);
          expect(err.response.statusText).toBe('Not Found');
          done();
        });
    });
  });
});

describe('request with JSON response', () => {
  // Before each test, stub the fetch function
  beforeEach(() => {
    window.fetch = jest.fn();
  });

  describe('stubbing 200 successful response', () => {
    // Before each test, pretend we got a successful response
    beforeEach(() => {
      const res = new Response('{"hello":"world"}', {
        status: 200,
        headers: {
          'Content-type': 'application/json',
        },
      });

      window.fetch.mockReturnValue(Promise.resolve(res));
    });

    it('should format the response correctly', (done) => {
      request('/url')
        .catch((err) => expect(err).toBeUndefined() && done())
        .then((json) => {
          expect(json.hello).toBe('world');
          done();
        });
    });
  });
});

describe('request with XML response', () => {
  // Before each test, stub the fetch function
  beforeEach(() => {
    window.fetch = jest.fn();
  });

  describe('stubbing 200 successful response', () => {
    // Before each test, pretend we got a successful response
    beforeEach(() => {
      const res = new Response('<root attr="hello">world</root>', {
        status: 200,
        headers: {
          'Content-type': 'application/xml',
        },
      });

      window.fetch.mockReturnValue(Promise.resolve(res));
    });

    it('should contain an attribue', (done) => {
      request('/url')
        .catch((err) => expect(err).toBeUndefined() && done())
        .then((xml) => {
          const received = xml.getElementsByTagName('root')[0].getAttribute('attr');
          const expected = 'hello';
          expect(received).toBe(expected);
          done();
        });
    });

    it('should contain text', (done) => {
      request('/url')
        .catch((err) => expect(err).toBeUndefined() && done())
        .then((xml) => {
          const received = xml.getElementsByTagName('root')[0].innerHTML;
          const expected = 'world';
          expect(received).toBe(expected);
          done();
        });
    });
  });
});
