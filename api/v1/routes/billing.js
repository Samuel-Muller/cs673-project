const express = require('express')
const router = express.Router()

let reports = []
let payments = []

/**
* @openapi
* /payments:
*   get:
*     tags:
*       - Payments
*     produces:
*       - application/json
*     description: Get all payments localhost:3000/billing/payments
*     responses:
*       200:
*         description: Returns payments
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to access payments
*       404:
*         description: Payments not found
*       500:
*         description: Internal server error
*   post:
*     tags:
*       - Payments
*     description: Create new payment
*     responses:
*       200:
*         description: Payment created
*       400:
*         description: Invalid payment details
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to create payment
*       500:
*         description: Internal server error
*/
router.route('/payments')
    .get((req, res) => {
        try {
            if (req.body.userID && req.body.clientID) {
                if (req.body.clientID !== "123abc") {
                    return res.status(401).send('Client not authorized')
                }
                if (req.body.userID !== "123") {
                    return res.status(403).send('User is not authorized to create payment')
                }
                if (payments.length > 0) {
                    return res.status(200).send(payments)
                } else {
                    return res.status(404).send('No payments found')
                }
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })
    .post((req, res) => {
        try {
            if (req.body.userID && req.body.clientID && req.body.totalAmount && req.body.minimumDue && req.body.invoiceDate && req.body.dueDate) {
                if (req.body.clientID !== "123abc") {
                    return res.status(401).send('Client not authorized')
                }
                if (req.body.userID !== "123") {
                    return res.status(403).send('User is not authorized to create payment')
                }
                const record = {
                    paymentID: 'py' + Math.floor((Math.random() * 99999) + 10000),
                    confirmationCode: 'CTR' + Math.floor((Math.random() * 99999) + 10000),
                }

                payments.push({
                    userID: req.body.userID,
                    clientID: req.body.clientID,
                    paymentID: record.paymentID,
                    totalAmount: req.body.totalAmount,
                    minimumDue: req.body.minimumDue,
                    invoiceDate: req.body.invoiceDate,
                    dueDate: req.body.dueDate
                })
                return res.status(200).send(record)
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })

/**
* @openapi
* /payments/{payment_id}:
*   get:
*     tags:
*       - Payments
*     produces:
*       - application/json
*     description: Get payment details
*     responses:
*       200:
*         description: Returns payment details
*       400:
*         description: Invalid payment ID
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to access payment details
*       404:
*         description: Payment details not found
*       500:
*         description: Internal server error
*   put:
*     tags:
*       - Payments
*     description: Update payment details
*     responses:
*       200:
*         description: Payment updated
*       400:
*         description: Invalid payment ID
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to update payment details
*       404:
*         description: Payment details not found
*       500:
*         description: Internal server error
*   delete:
*     tags:
*       - Payments
*     description: Delete payment by ID
*     responses:
*       200:
*         description: Payment deleted
*       400:
*         description: Invalid payment ID
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to delete payment
*       404:
*         description: Payment not found
*       500:
*         description: Internal server error
*/
router.route('/payments/:payment_id')
    .get((req, res) => {
        try {
            if (req.body.userID && req.body.clientID) {
                if (req.body.clientID !== "123abc") {
                    return res.status(401).send('Client not authorized')
                }
                if (req.body.userID !== "123") {
                    return res.status(403).send('User is not authorized to create payment')
                }
                if (req.params.payment_id && req.params.payment_id.startsWith('py')) {
                    const payment = payments.find(payment => payment.paymentID === req.params.payment_id)
                    if (!payment) {
                        return res.status(404).send('No payments found')
                    }
                    return res.status(200).send(payment)
                } else {
                    return res.status(400).send('Invalid payment ID')
                }
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })
    .put((req, res) => {
        try {
            if (req.body.userID && req.body.clientID && req.body.totalAmount && req.body.minimumDue && req.body.invoiceDate && req.body.dueDate) {
                if (req.body.clientID !== "123abc") {
                    return res.status(401).send('Client not authorized')
                }
                if (req.body.userID !== "123") {
                    return res.status(403).send('User is not authorized to create payment')
                }

                if (req.params.payment_id && req.params.payment_id.startsWith('py')) {
                    const payment = payments.find(payment => payment.paymentID === req.params.payment_id)
                    if (!payment) {
                        return res.status(404).send('No payments found')
                    }
                    const newPayments = payments.filter(payment => payment.paymentID !== req.params.payment_id)
                    payments = newPayments

                    const record = {
                        paymentID: payment.paymentID,
                        confirmationCode: 'CTR' + Math.floor((Math.random() * 99999) + 10000),
                    }

                    payments.push({
                        userID: req.body.userID,
                        clientID: req.body.clientID,
                        paymentID: record.paymentID,
                        totalAmount: req.body.totalAmount,
                        minimumDue: req.body.minimumDue,
                        invoiceDate: req.body.invoiceDate,
                        dueDate: req.body.dueDate
                    })

                    return res.status(200).send(record)
                } else {
                    return res.status(400).send('Invalid payment ID')
                }
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }

    })
    .delete((req, res) => {
        try {
            if (req.body.userID && req.body.clientID) {
                if (req.body.clientID !== "123abc") {
                    return res.status(401).send('Client not authorized')
                }
                if (req.body.userID !== "123") {
                    return res.status(403).send('User is not authorized to create payment')
                }
                if (req.params.payment_id && req.params.payment_id.startsWith('py')) {
                    const payment = payments.find(payment => payment.paymentID === req.params.payment_id)
                    if (!payment) {
                        return res.status(404).send('No payment found')
                    }
                    const newPayments = payments.filter(payment => payment.paymentID !== req.params.payment_id)
                    payments = newPayments
                    return res.status(200).send('Payment deleted')
                } else {
                    return res.status(400).send('Invalid payment ID')
                }
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })

/**
* @openapi
* /reports:
*   get:
*     tags:
*       - Reports
*     produces:
*       - application/json
*     description: Get all reports
*     responses:
*       200:
*         description: Returns reports
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to access reports
*       404:
*         description: Reports not found
*       500:
*         description: Internal server error
*   post:
*     tags:
*       - Reports
*     description: Create new report
*     responses:
*       200:
*         description: Report created
*       400:
*         description: Invalid report details
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to create report
*       500:
*         description: Internal server error
*/
router.route('/reports')
    .get((req, res) => {
        try {
            if (req.body.userID && req.body.clientID) {
                if (req.body.clientID !== "123abc") {
                    return res.status(401).send('Client not authorized')
                }
                if (req.body.userID !== "123") {
                    return res.status(403).send('User is not authorized to create payment')
                }
                if (reports.length > 0) {
                    return res.status(200).send(reports)
                } else {
                    return res.status(404).send('No reports found')
                }
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })
    .post((req, res) => {
        try {
            if (req.body.userID && req.body.clientID && req.body.totalBalance && req.body.startDate && req.body.endDate) {
                if (req.body.clientID !== "123abc") {
                    return res.status(401).send('Client not authorized')
                }
                if (req.body.userID !== "123") {
                    return res.status(403).send('User is not authorized to create report')
                }
                const record = {
                    reportID: 'py' + Math.floor((Math.random() * 99999) + 10000),
                    confirmationCode: 'CTR' + Math.floor((Math.random() * 99999) + 10000),
                }

                reports.push({
                    userID: req.body.userID,
                    clientID: req.body.clientID,
                    reportID: record.reportID,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    totalBalance: req.body.totalBalance
                })
                return res.status(200).send(record)
            } else {
                return res.status(400).send('Invalid report details')
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })

/**
* @openapi
* /reports/{report_id}:
*   get:
*     tags:
*       - Reports
*     produces:
*       - application/json
*     description: Get report by ID
*     responses:
*       200:
*         description: Returns report
*       400:
*         description: Invalid report ID
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to access report
*       404:
*         description: Report not found
*       500:
*         description: Internal server error
*   put:
*     tags:
*       - Reports
*     description: Update report by ID
*     responses:
*       200:
*         description: Report updated
*       400:
*         description: Invalid report ID
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to update report
*       404:
*         description: Report not found
*       500:
*         description: Internal server error
*   delete:
*     tags:
*       - Reports
*     description: Delete report by ID
*     responses:
*       200:
*         description: Report deleted
*       400:
*         description: Invalid report ID
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to delete report
*       404:
*         description: Report not found
*       500:
*         description: Internal server error
*/
router.route('/reports/:report_id')
    .get((req, res) => {
        try {
            if (req.body.userID && req.body.clientID) {
                if (req.body.clientID !== "123abc") {
                    return res.status(401).send('Client not authorized')
                }
                if (req.body.userID !== "123") {
                    return res.status(403).send('User is not authorized to create report')
                }
                if (req.params.report_id && req.params.report_id.startsWith('py')) {
                    const report = reports.find(report => report.reportID === req.params.report_id)
                    if (!report) {
                        return res.status(404).send('No reports found')
                    }
                    return res.status(200).send(report)
                } else {
                    return res.status(400).send('Invalid report ID')
                }
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })
    .put((req, res) => {
        try {
            if (req.body.userID && req.body.clientID && req.body.totalBalance && req.body.startDate && req.body.endDate) {
                if (req.body.clientID !== "123abc") {
                    return res.status(401).send('Client not authorized')
                }
                if (req.body.userID !== "123") {
                    return res.status(403).send('User is not authorized to create report')
                }

                if (req.params.report_id && req.params.report_id.startsWith('py')) {
                    const report = reports.find(report => report.reportID === req.params.report_id)
                    if (!report) {
                        return res.status(404).send('No reports found')
                    }
                    const newReports = reports.filter(report => report.reportID !== req.params.report_id)
                    reports = newReports

                    const record = {
                        reportID: report.reportID,
                        confirmationCode: 'CTR' + Math.floor((Math.random() * 99999) + 10000),
                    }

                    reports.push({
                        userID: req.body.userID,
                        clientID: req.body.clientID,
                        reportID: record.reportID,
                        startDate: req.body.startDate,
                        endDate: req.body.endDate,
                        totalBalance: req.body.totalBalance
                    })


                    return res.status(200).send(record)
                } else {
                    return res.status(400).send('Invalid report ID')
                }
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }

    })
    .delete((req, res) => {
        try {
            if (req.body.userID && req.body.clientID) {
                if (req.body.clientID !== "123abc") {
                    return res.status(401).send('Client not authorized')
                }
                if (req.body.userID !== "123") {
                    return res.status(403).send('User is not authorized to create report')
                }
                if (req.params.report_id && req.params.report_id.startsWith('py')) {
                    const report = reports.find(report => report.reportID === req.params.report_id)
                    if (!report) {
                        return res.status(404).send('No report found')
                    }
                    const newReports = reports.filter(report => report.reportID !== req.params.report_id)
                    reports = newReports
                    return res.status(200).send('Report deleted')
                } else {
                    return res.status(400).send('Invalid report ID')
                }
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })

module.exports = router