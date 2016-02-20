automatic-octo-doodle
=====================

Data -> Webapp

Installation
------------

```bash
$ cp env.sample .env          # and modify if necessary
$ npm install -g bower gulp
$ npm install
$ bower install
```

Deployment
----------

#### Development

```bash
$ npm run start:dev
$ browser http://localhost:8080
```

#### Production

```bash
$ npm run deploy
$ browser https://secret-bastion-53821.herokuapp.com/
```
