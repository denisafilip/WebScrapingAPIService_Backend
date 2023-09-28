const { App } = require('./src/app');
const PORT = 8080;

const app = new App(PORT);

app.start().then();