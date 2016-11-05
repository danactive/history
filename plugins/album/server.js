const hapi = require('hapi');
const vision = require('vision');
const hapiReactViews = require('hapi-react-views');

require('babel-core/register')({
  presets: ['react', 'es2015'],
});

const server = new hapi.Server();
server.connection();

server.register(vision, (pluginError) => {
  if (pluginError) {
    console.log('Failed to load vision.');
  }

  server.views({
    engines: {
      jsx: hapiReactViews,
    },
    compileOptions: {}, // optional
    relativeTo: __dirname,
    path: 'views',
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => reply.view('home'),
  });

  server.start((startError) => {
    if (startError) {
      throw startError;
    }

    console.log(`Server is listening at ${server.info.uri}`);
  });
});
