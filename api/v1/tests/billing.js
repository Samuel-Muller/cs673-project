const chai = require('chai')
chai.use(require('chai-http'))
let payment
let invoice
let report

describe('Create Invoice', () => {
    const app = require('../../../server.js')

    it('Should create an invoice (200)', done => {
        chai
            .request(app)
            .post('/billing/invoices')
            .set('content-type', 'application/json')
            .send({
                "userID": 1000,
                "payerID": 1001,
                "invoiceTitle": "Integration Test Invoice",
                "diagnosis": "Test",
                "totalAmount": 50,
                "minimumDue": 10,
                "dueDate": "12/30/22",
                "icd10": ["T3.10"]
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(200)
                invoice = res.body
                done()
            })
    })

    it('Should fail to create invoice due to request body being setup wrongly without payerID (400)', done => {
        chai
            .request(app)
            .post('/billing/invoices')
            .set('content-type', 'application/json')
            .send({
                "userID": 1000,
                "invoiceTitle": "Integration Test Invoice",
                "diagnosis": "Test",
                "totalAmount": 50,
                "minimumDue": 10,
                "dueDate": "12/30/22",
                "icd10": ["T3.10"]
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.text).to.equal('No body parameters. Must include userID, payerID, invoiceTitle, diagnosis, totalAmount, minimumDue, dueDate, and icd10 in body')
                done()
            })
    })

    it('Should delete previously created invoice (200)', done => {
        chai
            .request(app)
            .delete('/billing/invoices/' + invoice.invoiceID)
            .set('content-type', 'application/json')
            .send({
                "userID": 1000
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.text).to.equal('Invoice deleted')
                done()
            })
    })
})

describe('Create Payment', () => {
    const app = require('../../../server.js')

    it('Should create an payment (200)', done => {
        chai
            .request(app)
            .post('/billing/payments')
            .set('content-type', 'application/json')
            .send({
                "userID": 1000,
                "invoiceID": 4,
                "totalAmount": 1,
                "cardNum": "1234567812345678",
                "cardExp": "1223"
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(200)
                payment = res.body
                done()
            })
    })

    it('Should fail to create payment due to request body being setup wrongly without invoiceID (400)', done => {
        chai
            .request(app)
            .post('/billing/payments')
            .set('content-type', 'application/json')
            .send({
                "userID": 1000,
                "totalAmount": 1,
                "cardNum": "1234567812345678",
                "cardExp": "1223"
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.text).to.equal('Invalid body parameters. Must include userID, invoiceID, totalAmount, cardNum, and cardExp')
                done()
            })
    })

    it('Should update previously created payment (200)', done => {
        chai
            .request(app)
            .put('/billing/payments/' + payment.paymentID)
            .set('content-type', 'application/json')
            .send({
                "userID": 1000,
                "invoiceID": 4,
                "totalAmount": 0.5,
                "cardNum": "1234567812345678",
                "cardExp": "1223"
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(200)
                done()
            })
    })
})

describe('Create Report', () => {
    const app = require('../../../server.js')

    it('Should create a report (200)', done => {
        chai
            .request(app)
            .post('/billing/reports')
            .set('content-type', 'application/json')
            .send({
                "userID": 1000,
                "startDate": "01/01/2020",
                "endDate": "01/01/2021"
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(200)
                report = res.body
                done()
            })
    })

    it('Should fail to create report due to request body being setup wrongly without endDate (400)', done => {
        chai
            .request(app)
            .post('/billing/reports')
            .set('content-type', 'application/json')
            .send({
                "userID": 1000,
                "startDate": "01/01/2020"
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.text).to.equal('Invalid body. Must include userID, startDate, and endDate in body.')
                done()
            })
    })

    it('Should delete previously created report (200)', done => {
        chai
            .request(app)
            .delete('/billing/reports/' + report.reportID)
            .set('content-type', 'application/json')
            .send({
                "userID": 1000
            })
            .end((_, res) => {
                chai.expect(res).to.have.status(200)
                done()
            })
    })
})