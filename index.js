const { App } = require('./src/app');
const PORT = 8080;

const app = new App(process.env.PORT || PORT);

app.start().then();