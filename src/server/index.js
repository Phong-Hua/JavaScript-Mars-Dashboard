require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls



/**
 * This api get rover info
 */
app.get('/rovers/:rover', async(req, res) => {
    try{
        const rover = req.params.rover;
        let data = await fetch (`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send(data);
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/latest_photos/:rover/:date', async (req, res) => {
    try {
        const {rover, date} = req.params;
        let data = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${date}&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send(data);
    }
    catch (err) {
        console.log('error: ', err)
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))