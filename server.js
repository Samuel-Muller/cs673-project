const express = require('express')
const app = express()
const port = 3000

//TODO: document each API endpoint
app.get('/billing/payment', (req, res) => {
    res.send('TODO: get payment info')
})

app.post('/billing/payment', (req, res) => {
    res.send('TODO: create payment')
})

app.put('/billing/payment', (req, res) => {
    res.send('TODO: update payment')
})

app.get('/billing/report', (req, res) => {
    res.send('TODO: get report info')
})

app.post('/billing/report', (req, res) => {
    res.send('TODO: create report')
})

app.put('/billing/report', (req, res) => {
    res.send('TODO: update report')
})

app.delete('/billing/report', (req, res) => {
    res.send('TODO: delete report')
})

app.listen(port, () => {
    console.log(`API listening on port ${port}`)
})