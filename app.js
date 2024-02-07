var express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const asyncWrapper = require('./async')
require('dotenv').config()

app.use(express.json())
app.use(bodyParser.json())
app.use(cors())
app.use(express.urlencoded({extended: false})) 
app.use(bodyParser.urlencoded({extended: false}));


const estateSecretKeys = {
    101: process.env.SecretKey101,
    102: process.env.SecretKey102,
    103: process.env.SecretKey103,
    104: process.env.SecretKey104,
    105: process.env.SecretKey105
    // Add more estates as needed
    };

    const verifyTrans = asyncWrapper(
        async (req, res) => {
            var refID = req.body.reference;
            //pass in the estateId from the app so i can get the exact secretKey
            var estateID = 101;
    
            //get the secret key of the entered estateiD
            const SecretKey = estateSecretKeys[estateID];
            //and get the secret for the exact bearer
            if (!SecretKey) {
                console.error('Invalid estate name:', estateID);
                res.status(400).json({ error: 'Invalid estate name' });
                return;
            }
    
            const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/transaction/verify/'+ refID,
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + SecretKey
            }
            }
    
            https.request(options, resS => {
            let data = ''
    
            resS.on('data', (chunk) => {
                data += chunk
            });
    
            resS.on('end', () => {
                res.send(data)
                console.log(JSON.parse(data))
            })
            }).on('error', error => {
            console.error(error)
            })
        },
    )

app.get('/transaction/callback', verifyTrans)


const port = process.env.PORT || 3000
app.listen(port, ()=> {
    console.log(`Server listening on port ${port}`);
});