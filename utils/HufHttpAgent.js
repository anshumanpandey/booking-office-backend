const path = require('path');
var fs  = require('fs');
var https = require('https');

/**
 * @param {string} fullPath - api path to call. Ex: /api/v1/keyrings?externalUserRef=test
 * @param {Object} [body] - JSON body to post.
 * @param {string} [method=POST] - Request method.
 */
function callHufApi (fullPath, body, method = 'POST',) {
    return new Promise((resolved, rejected) => {
        const headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        }

        let stringBody = null
        if (body) { 
            stringBody = JSON.stringify(body)
            headers['Content-Length'] = stringBody.length
        }

        var options = {
            hostname: 'b2b-api.hufsm.com',
            port: 5332,
            path: fullPath,
            method: method,
            key: fs.readFileSync(path.join(__dirname, 'privkey.pem')),
            cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),  
            headers: headers
        };
    
        var req = https.request(options, function(res) {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                body += chunk;
            });

            res.on('end', function() {
                if (res.statusCode !== 200) {
                    rejected(JSON.parse(body))
                } else {
                    try {
                        resolved(JSON.parse(body))
                    } catch (error) {
                        resolved(d)
                    }
                }
            });
        });

        req.on('error', (e) => {
            rejected(e)
        });

        if (stringBody) {
            req.write(stringBody)
        }
        
        req.end()
    });
}

function grantCar (correlationId, vehicleAccessGrantId) {
    const data = {
        "eventType": "huf.vehicleAccessGranted",
        "correlationId": correlationId,
        "eventPayload": {
          "vehicleAccessGrantId": vehicleAccessGrantId,
          "forwardTo": "ubigo",
          "externalUserRef": "4321",
          "tenantId": "FooRental",
          "externalVehicleRef": "1234",
          "startTime": "2020-06-07T12:45:00.000Z",
          "endTime": "2020-06-10T12:45:00.000Z"
        }
      }
    return callHufApi('/api/v1/events', data)
    .then(res => {
        console.log(res)
        return res
    })
    .catch(err => console.log(err))
}

function revokeCar(correlationId, vehicleAccessGrantId) {
    const data = {
        "eventType": "huf.vehicleAccessRevoked",
        "correlationId": correlationId,
        "eventPayload": {
          "vehicleAccessGrantId": vehicleAccessGrantId
        }
      }
    return callHufApi('/api/v1/events', )
    .catch(err => console.log(err))
}

function grantCarDoors (correlationId, vehicleAccessGrantId) {
    const data = {
        "eventType": "huf.vehicleDoorsAccessGranted",
        "correlationId": correlationId,
        "eventPayload": {
          "vehicleAccessGrantId": vehicleAccessGrantId,
          "externalUserRef": "4321",
          "tenantId": "FooRental",
          "externalVehicleRef": "1234",
          "startTime": "2018-06-07T12:45:00.000Z",
          "endTime": "2018-06-10T12:45:00.000Z"
        }
      }
    return callHufApi('/api/v1/events', data)
    .then(res => {
        console.log('Door cars access granted!')
        console.log(res)
        return res
    })
    .catch(err => console.log(err))
}

function getKeyrings () {
    return callHufApi('/api/v1/keyrings?externalUserRef=1', null, 'GET')
    .then(res => {
        return res
    })
    .catch(err => console.log(err))
}

const correlationId = "bedaca85-555d-4a84-b9c2-9ca54e4d7d71"
const vehicleAccessGrantId = "53f19856-493b-48ec-be79-09a5a31243a4"

//grantCar(correlationId, vehicleAccessGrantId)
//grantCarDoors(correlationId, vehicleAccessGrantId)


module.exports = {
    callHufApi,
    getKeyrings    
}
