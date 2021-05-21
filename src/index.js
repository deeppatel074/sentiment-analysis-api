/* eslint-disable no-console */
/**
 * Server setup
 */
import express from 'express';
import chalk from 'chalk';

import './config/database';
import middlewaresConfig from './config/middlewares';
import constants from './config/constants';
import ApiRoutes from './routes';
import http from 'http';
import https from 'https';
import fs from 'fs';


const app = express();

// Wrap all the middlewares with the server
middlewaresConfig(app);

// Add the apiRoutes stack to the server
app.use('/', ApiRoutes);

app.response.success = function (message, data, displayMessage, code) {
  console.log(chalk.green(message));
  this.status(200).send(
    Response('success', message, data, displayMessage, code),
  );
  console.log(chalk.bgGreen(chalk.black('Exited with Success Response\n')));
};

app.response.error = function (message, data, displayMessage, code) {
  console.log(chalk.red(message));
  message = typeof message != 'string' ? 'Something went wrong' : message;
  this.status(200).send(Response('error', message, data, displayMessage, code));
  console.log(chalk.bgRed(chalk.black('Exited with Error Response\n')));
};

app.response.unauthorizedUser = function () {
  console.log(chalk.yellow('Unauthorized User'));
  this.status(403).send(
    Response('error', 'Unauthorized User', null, null, 403),
  );
  console.log(
    chalk.bgYellow(
      chalk.black(
        'Exited with Error response because user is not authorized to use this app\n',
      ),
    ),
  );
};

app.response.accessDenied = function () {
  console.log(chalk.cyan('Access Denied. Check role of User and RBAC list'));
  this.status(200).send(Response('error', 'Access Denied', null, null, 500));
  console.log(
    chalk.bgCyan(
      chalk.black(
        'Exited with Error response because user dont have to permission to access this module\n',
      ),
    ),
  );
};

function Response(type, message, data, displayMessage, code) {
  let defaultCode = type === 'success' ? 200 : 500;
  return {
    code: code || defaultCode,
    message,
    data,
    displayMessage,
  };
}
// We need this to make sure we don't run a second instance
let server,
  protocol = '';
if (!module.parent) {
  let appEnv = process.env.NODE_ENV;
  if (appEnv === 'development') {
    protocol = 'HTTP';
    server = http.createServer(app);
  } else {
    protocol = 'HTTPS (Secure)';
    server = https.createServer(
      {
        key: fs.readFileSync(constants.SSL_KEY, 'utf8'),
        cert: fs.readFileSync(constants.SSL_CERT, 'utf8'),
      },
      app,
    );
  }
  server.listen(constants.PORT, err => {
    if (err) {
      console.log(chalk.red('Cannot run!'));
    } else {
      console.log(
        chalk.green.bold(
          `
        Yep this is working 🍺
        App listen on port: ${constants.PORT} 🍕
        Env: ${process.env.NODE_ENV} 🦄
      `,
        ),
      );
    }
  });
}

export default app;
