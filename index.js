const express = require('express');
const path = require('path');
const dashboard = express();
const config = require('./config.json');

dashboard.engine('html', require('ejs').renderFile);
dashboard.set('view engine', 'html');

// root/
const dashboardDirectory = path.resolve(
    `${process.cwd()}`,
);

// root/dashboard/public
dashboard.use(
    '/public',
    express.static(path.resolve(`${dashboardDirectory}${path.sep}public`)),
);

const renderTemplate = async (req, res, template, data = {}) => {
    const apiData = await require('./api_request').getApiInfo();
    res.render(
        path.resolve(`${dashboardDirectory}${path.sep}views${path.sep}${template}`),
        Object.assign(apiData, data),
    );
};

dashboard.get('/', (req, res) => {
    renderTemplate(req, res, 'home.ejs');
});

dashboard.listen(config.dashboardPort, () => console.log(`Je suis connecté sur le port: ${config.dashboardPort} !!`));