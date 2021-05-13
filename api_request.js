const config = require ('./config.json');
const Api = require('./api');
const api = new Api(config);

let data = {};

let BTCBalance = 0;
let EURBalance = 0;
let BTCValue = 0;
let unpaidBalance = 0;
let profilProb = 0;

const EURAmountToReach = config.amountToReach;
let missingBTCAmount = 0;
let missingEURAmount = 0;
let remainingTime = 0;

const getApiInfo = async () => {
    await api.getTime()
        .then(() => api.get('/main/api/v2/accounting/account2/BTC'))
        .then(res => {
            BTCBalance = parseFloat(res['totalBalance']);
        })

        .then(() => api.get('/exchange/api/v2/info/prices'))
        .then(res => {
            BTCValue = parseFloat(res['BTCEURS']);
        })

        .then(() => api.get(`/main/api/v2/mining/rig2/${config.rig}`))
        .then(res => {
            unpaidBalance = parseFloat(res['unpaidAmount']);
            profilProb = parseFloat(res['profitability']);
        })

        .catch(err => {
            if(err && err.response) console.error(err.response.request.method,err.response.request.uri.href);
            console.log('ERROR', err.error || err);
        });

    BTCBalance = BTCBalance + unpaidBalance;
    EURBalance = BTCValue * (BTCBalance + unpaidBalance);
    missingEURAmount = EURAmountToReach - EURBalance;
    missingBTCAmount = missingEURAmount / BTCValue;
    remainingTime = missingBTCAmount / profilProb;

    const executedDate = new Date();
    const remainingDate = new Date();
    remainingDate.setMinutes(remainingDate.getMinutes() + remainingTime * 24 * 60);

    remainingTime = dateDiff(executedDate, remainingDate);

    data = {
        BTCBalance,
        EURBalance,
        BTCValue,
        unpaidBalance,
        profilProb,
        EURAmountToReach,
        missingBTCAmount,
        missingEURAmount,
        executedDate,
        remainingDate,
        remainingTime
    }
    if (config.debugMode === true) { console.log(data); }
    return data;
}

const dateDiff = (date1, date2) => {
    let diff = {}                           // Initialisation du retour
    let tmp = date2 - date1;

    tmp = Math.floor(tmp/1000);             // Nombre de secondes entre les 2 dates
    diff.sec = tmp % 60;                    // Extraction du nombre de secondes

    tmp = Math.floor((tmp-diff.sec)/60);    // Nombre de minutes (partie entière)
    diff.min = tmp % 60;                    // Extraction du nombre de minutes

    tmp = Math.floor((tmp-diff.min)/60);    // Nombre d'heures (entières)
    diff.hour = tmp % 24;                   // Extraction du nombre d'heures

    tmp = Math.floor((tmp-diff.hour)/24);   // Nombre de jours restants
    diff.day = tmp;

    return diff;
}

module.exports = { getApiInfo };