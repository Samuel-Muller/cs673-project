const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const express = require('express')
const router = express.Router()

/**
* @openapi
* /payments:
*   get:
*     tags:
*       - Payments
*     produces:
*       - application/json
*     description: Get all payments localhost:3000/billing/payments
*     parameters:
*       - in: body
*         name: userID
*         schema:
*           description: User ID that is getting payments
*           required: true
*           type: int
*           example: {userID: 123}
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
*     parameters:
*       - in: body
*         name: userID
*         schema:
*           description: User ID that is creating payment
*           required: true
*           type: int
*           example: {userID: 123}
*       - in: body
*         name: invoiceID
*         schema:
*           description: Invoice ID that payment is paying towards
*           required: true
*           type: int
*           example: {invoiceID: 123}
*       - in: body
*         name: totalAmount
*         schema:
*           description: Total amount for this payment
*           required: true
*           type: float
*           example: {totalAmount: 123.00}
*       - in: body
*         name: cardNum
*         schema:
*           description: Credit card number
*           required: true
*           type: integer
*           example: {cardNum: 1234567812345678}
*       - in: body
*         name: cardExp
*         schema:
*           description: Credit card experation
*           required: true
*           type: integer
*           example: {cardNum: 0129}
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
    .get(async (req, res) => {
        try {
            if (req.body.userID) {
                if (req.body.userID !== 123) {
                    return res.status(403).send('User is not authorized to create payment')
                }
                prisma.payment.findMany().then((payments) => {
                    if (payments.length === 0) {
                        return res.status(404).send('Payments not found')
                    }
                    return res.status(200).send(payments)
                }).catch((e) => {
                    return res.status(400).send('Invalid payment details')
                })
            } else {
                return res.status(400).send('Invalid body parameters. Must include userID')
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })
    .post(async (req, res) => {
        try {
            if (req.body.userID && req.body.invoiceID && req.body.totalAmount && req.body.cardNum && req.body.cardExp) {
                if (req.body.userID !== 123) {
                    return res.status(403).send('User is not authorized to create payment')
                }
                let date = new Date()
                prisma.payment.create({
                    data: {
                        user_id: req.body.userID,
                        total_amount: req.body.totalAmount,
                        invoice_id: req.body.invoiceID,
                        payment_date: date,
                        insurance_id: 0,
                        card_number: req.body.cardNum,
                        card_exp: req.body.cardExp,
                    }
                }).then((payment) => {
                    // update invoice after successful payment
                    // prisma.invoice.update({
                    //     where: {
                    //         invoice_id: req.body.invoiceID
                    //     },
                    //     data: {
                    //         last_payment_date: date,
                    //         last_payment_amount: req.body.totalAmount,
                    //     }
                    // }).then((invoice) => {
                    return res.status(200).send(payment)
                    // }).catch((e) => {
                    //     return res.status(400).send('Could not update invoice after payment')
                    // })
                }).catch((e) => {
                    console.log(e)
                    return res.status(400).send('Invalid payment details')
                })
            } else {
                return res.status(400).send('Invalid body parameters. Must include userID, invoiceID, totalAmount, cardNum, and cardExp')
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
*     parameters:
*       - in: body
*         name: userID
*         schema:
*           description: User ID that is getting payment
*           required: true
*           type: int
*           example: {userID: 123}
*       - in: path
*         name: payment_id
*         schema:
*           description: Payment ID to retrieve
*           required: true
*           type: string
*           example: 1
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
*     parameters:
*       - in: body
*         name: userID
*         schema:
*           description: User ID that is updating payment
*           required: true
*           type: int
*           example: {userID: 123}
*       - in: body
*         name: invoiceID
*         schema:
*           description: Invoice ID that payment is being updated
*           required: true
*           type: int
*           example: {invoiceID: 123}
*       - in: body
*         name: totalAmount
*         schema:
*           description: Total amount for this payment
*           required: true
*           type: float
*           example: {totalAmount: 123.00}
*       - in: body
*         name: cardNum
*         schema:
*           description: Credit card number
*           required: true
*           type: integer
*           example: {cardNum: 1234567812345678}
*       - in: body
*         name: cardExp
*         schema:
*           description: Credit card experation
*           required: true
*           type: integer
*           example: {cardNum: 0129}
*       - in: path
*         name: payment_id
*         schema:
*           description: Payment ID that is being updated
*           required: true
*           type: string
*           example: 1
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
*     parameters:
*       - in: body
*         name: userID
*         schema:
*           description: User ID that is deleting payment
*           required: true
*           type: int
*           example: {userID: 123}
*       - in: path
*         name: payment_id
*         schema:
*           description: Payment ID that is being deleted
*           required: true
*           type: int
*           example: 1
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
    .get(async (req, res) => {
        try {
            if (req.body.userID && req.params.payment_id) {
                if (req.body.userID !== 123) {
                    return res.status(403).send('User is not authorized to create payment')
                }
                prisma.payment.findUnique({
                    where: {
                        payment_id: Number(req.params.payment_id)
                    }
                }).then((payments) => {
                    if (!payments) {
                        return res.status(404).send('Payment not found')
                    }
                    return res.status(200).send(payments)
                }).catch((e) => {
                    console.log(e)
                    return res.status(400).send('Invalid payment details')
                })
            } else {
                return res.status(400).send('Invalid body and/or path parameters. Must include userID in body and payment_id in path')
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })
    .put(async (req, res) => {
        try {
            if (req.body.userID && req.body.totalAmount && req.body.cardNum && req.body.cardExp && req.params.payment_id) {
                if (req.body.userID !== 123) {
                    return res.status(403).send('User is not authorized to create payment')
                }
                let date = new Date()
                if (req.params.payment_id) {
                    prisma.payment.update({
                        where: {
                            payment_id: Number(req.params.payment_id)
                        },
                        data: {
                            user_id: req.body.userID,
                            total_amount: req.body.totalAmount,
                            insurance_id: 0,
                            card_number: req.body.cardNum,
                            card_exp: req.body.cardExp,
                        }
                    }).then((payment) => {
                        // update invoice after updating payment
                        prisma.invoice.update({
                            where: {
                                invoice_id: req.body.invoiceID
                            },
                            data: {
                                last_payment_date: date,
                                last_payment_amount: req.body.totalAmount,
                            }
                        }).then((invoice) => {
                            return res.status(200).send(payment)
                        }).catch((e) => {
                            return res.status(400).send('Could not update invoice after payment')
                        })
                    }).catch((e) => {
                        return res.status(400).send('Invalid payment details')
                    })
                } else {
                    return res.status(400).send('Invalid payment ID')
                }
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }

    })
    .delete(async (req, res) => {
        try {
            if (req.body.userID && req.params.payment_id) {
                if (req.body.userID !== 123) {
                    return res.status(403).send('User is not authorized to create payment')
                }
                if (req.params.payment_id) {
                    prisma.payment.delete({
                        where: {
                            payment_id: Number(req.params.payment_id)
                        }
                    }).then((payment) => {
                        //TODO: update invoice after deleting payment
                        return res.status(200).send('Payment deleted')
                    }).catch((e) => {
                        return res.status(400).send('Invalid payment ID')
                    })
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
* /invoices:
*   get:
*     tags:
*       - Invoices
*     produces:
*       - application/json
*     description: Get all invoices
*     parameters:
*       - in: body
*         name: userID
*         schema:
*           description: User ID that is getting invoices
*           required: true
*           type: int
*           example: {userID: 123}
*     responses:
*       200:
*         description: Returns invoices
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to access invoices
*       404:
*         description: Invoices not found
*       500:
*         description: Internal server error
*   post:
*     tags:
*       - Invoices
*     description: Create new invoice
*     parameters:
*       - in: body
*         name: userID
*         schema:
*           description: User ID that is creating invoice
*           required: true
*           type: int
*           example: {userID: 123}
*       - in: body
*         name: invoiceTitle
*         schema:
*           description: Invoice title 
*           required: true
*           type: string
*           example: {invoiceTitle: "Mike Smith Appointment 11/30/2022"}
*       - in: body
*         name: diagnosis
*         schema:
*           description: Diagnosis description
*           required: true
*           type: string
*           example: {diagnosis: "Light cough"}
*       - in: body
*         name: totalAmount
*         schema:
*           description: Total amount due for invoice
*           required: true
*           type: float
*           example: {totalAmount: 55.00}
*       - in: body
*         name: minimumDue
*         schema:
*           description: Minimum due for a payment
*           required: true
*           type: float
*           example: {minimumDue: 25.00}
*       - in: body
*         name: dueDate
*         schema:
*           description: Date for invoice to be paid by
*           required: true
*           type: string
*           example: "12/30/2022"
*     responses:
*       200:
*         description: Invoice created
*       400:
*         description: Invalid invoice details
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to create invoice
*       500:
*         description: Internal server error
*/
router.route('/invoices')
    .get(async (req, res) => {
        try {
            if (req.body.userID) {
                if (req.body.userID !== 123) {
                    return res.status(403).send('User is not authorized to create invoice')
                }
                prisma.invoice.findMany().then((invoices) => {
                    if (invoices.length === 0) {
                        return res.status(404).send('Invoices not found')
                    }
                    return res.status(200).send(invoices)
                }).catch((e) => {
                    return res.status(400).send('Invalid invoice details')
                })
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })
    .post(async (req, res) => {
        try {
            if (true) {
                if (req.body.userID !== 123) {
                    return res.status(403).send('User is not authorized to create invoice')
                }
                let date = new Date()
                var parsedDueDate = Date.parse(req.body.dueDate);
                var dueDate = new Date(parsedDueDate);
                prisma.invoice.create({
                    data: {
                        user_id: req.body.userID,
                        insurance_id: 0,
                        invoice_title: req.body.invoiceTitle,
                        invoice_date: date,
                        diagnosis: req.body.diagnosis,
                        total_amount: req.body.totalAmount,
                        due_date: dueDate,
                        minimum_due: req.body.minimumDue,
                        last_payment_date: null,
                        approved: 0
                    }
                }).then((invoice) => {
                    return res.status(200).send(invoice)
                }).catch((e) => {
                    console.log(e)
                    return res.status(400).send('Invalid invoice details')
                })
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })

/**
* @openapi
* /invoices/{invoice_id}:
*   get:
*     tags:
*       - Invoices
*     produces:
*       - application/json
*     description: Get invoice details
*     parameters:
*       - in: body
*         name: userID
*         schema:
*           description: User ID that is getting invoice
*           required: true
*           type: int
*           example: {userID: 123}
*       - in: path
*         name: invoice_id
*         schema:
*           description: Invoice ID to retrieve
*           required: true
*           type: string
*           example: 1
*     responses:
*       200:
*         description: Returns invoice details
*       400:
*         description: Invalid invoice ID
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to access invoice details
*       404:
*         description: Invoice details not found
*       500:
*         description: Internal server error
*   put:
*     tags:
*       - Invoices
*     description: Update invoice details
*     parameters:
*       - in: body
*         name: userID
*         schema:
*           description: User ID that is creating invoice
*           required: true
*           type: int
*           example: {userID: 123}
*       - in: body
*         name: invoiceTitle
*         schema:
*           description: Invoice title 
*           required: true
*           type: string
*           example: {invoiceTitle: "Mike Smith Appointment 11/30/2022"}
*       - in: body
*         name: diagnosis
*         schema:
*           description: Diagnosis description
*           required: true
*           type: string
*           example: {diagnosis: "Light cough"}
*       - in: body
*         name: totalAmount
*         schema:
*           description: Total amount due for invoice
*           required: true
*           type: float
*           example: {totalAmount: 55.00}
*       - in: body
*         name: minimumDue
*         schema:
*           description: Minimum due for a payment
*           required: true
*           type: float
*           example: {minimumDue: 25.00}
*       - in: body
*         name: dueDate
*         schema:
*           description: Date for invoice to be paid by
*           required: true
*           type: string
*           example: "12/30/2022"
*       - in: path
*         name: invoice_id
*         schema:
*           description: Invoice ID that is being updated
*           required: true
*           type: string
*           example: 1
*     responses:
*       200:
*         description: Invoice updated
*       400:
*         description: Invalid invoice ID
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to update invoice details
*       404:
*         description: Invoice details not found
*       500:
*         description: Internal server error
*   delete:
*     tags:
*       - Invoices
*     description: Delete invoice by ID
*     parameters:
*       - in: body
*         name: userID
*         schema:
*           description: User ID that is creating invoice
*           required: true
*           type: int
*           example: {userID: 123}
*       - in: path
*         name: invoice_id
*         schema:
*           description: Invoice ID that is being updated
*           required: true
*           type: string
*           example: 1
*     responses:
*       200:
*         description: Invoice deleted
*       400:
*         description: Invalid invoice ID
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to delete invoice
*       404:
*         description: Invoice not found
*       500:
*         description: Internal server error
*/
router.route('/invoices/:invoice_id')
    .get(async (req, res) => {
        try {
            if (req.body.userID && req.params.invoice_id) {
                if (req.body.userID !== 123) {
                    return res.status(403).send('User is not authorized to access invoice')
                }
                prisma.invoice.findUnique({
                    where: {
                        invoice_id: req.params.invoice_id
                    }
                }).then((invoice) => {
                    if (!invoice) {
                        return res.status(404).send('Invoice not found')
                    }
                    return res.status(200).send(invoice)
                }).catch((e) => {
                    return res.status(400).send('Invalid invoice details')
                })
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })
    .put(async (req, res) => {
        try {
            if (req.body.userID && req.body.invoiceTitle && req.body.diagnosis && req.body.totalAmount && req.body.dueDate && req.body.minimumDue && req.params.invoice_id) {
                if (req.body.userID !== 123) {
                    return res.status(403).send('User is not authorized to create invoice')
                }

                if (req.params.invoice_id) {
                    prisma.invoice.update({
                        where: {
                            invoice_id: req.params.invoice_id
                        },
                        data: {
                            user_id: req.body.userID,
                            insurance_id: 0, //TODO: implement insurance
                            invoice_title: req.body.invoiceTitle,
                            invoice_date: Date.now(),
                            diagnosis: req.body.diagnosis,
                            total_amount: req.body.totalAmount,
                            due_date: req.body.dueDate,
                            minimum_due: req.body.minimumDue
                        }
                    }).then((invoice) => {
                        return res.status(200).send(invoice)
                    }).catch((e) => {
                        return res.status(400).send('Invalid invoice details')
                    })
                } else {
                    return res.status(400).send('Invalid invoice ID')
                }
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })
    .delete(async (req, res) => {
        try {
            if (req.body.userID && req.params.invoice_id) {
                if (req.body.userID !== 123) {
                    return res.status(403).send('User is not authorized to create invoice')
                }
                if (req.params.invoice_id) {
                    prisma.invoice.delete({
                        where: {
                            invoice_id: req.params.invoice_id
                        }
                    }).then((invoice) => {
                        return res.status(200).send('Invoice deleted')
                    }).catch((e) => {
                        return res.status(404).send('Invoice not found')
                    })
                } else {
                    return res.status(400).send('Invalid invoice ID')
                }
            }
        } catch (e) {
            return res.status(500).send('Internal server error')
        }
    })
/**
* @openapi
* /invoices/{invoice_id}/approve:
*   post:
*     tags:
*       - Invoices
*     produces:
*       - application/json
*     description: Approve an invoice
*     parameters:
*       - in: body
*         name: userID
*         schema:
*           description: User ID that is approving invoice
*           required: true
*           type: int
*           example: {userID: 123}
*       - in: path
*         name: invoice_id
*         schema:
*           description: Invoice ID that is being approved
*           required: true
*           type: string
*           example: 1
*     responses:
*       200:
*         description: Returns invoice details
*       400:
*         description: Invalid invoice ID
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to access invoice details
*       404:
*         description: Invoice not found
*       500:
*         description: Internal server error
*/
router.route('/invoices/:invoice_id/approve')
    .post(async (req, res) => {
        try {
            if (req.body.userID && req.params.invoice_id) {
                if (req.body.userID !== 123) {
                    return res.status(403).send('User is not authorized to approve invoice')
                }

                if (req.params.invoice_id) {
                    prisma.invoice.update({
                        where: {
                            invoice_id: Number(req.params.invoice_id)
                        },
                        data: {
                            approved: 1
                        }
                    }).then((invoice) => {
                        return res.status(200).send(invoice)
                    }).catch((e) => {
                        return res.status(404).send('Invoice not found')
                    })
                } else {
                    return res.status(400).send('Invalid invoice ID')
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
            if (req.body.userID) {
                if (req.body.userID !== 123) {
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
            if (req.body.userID && req.body.totalBalance && req.body.startDate && req.body.endDate) {
                if (req.body.userID !== 123) {
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
            if (req.body.userID) {
                if (req.body.userID !== 123) {
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
            if (req.body.userID && req.body.totalBalance && req.body.startDate && req.body.endDate) {
                if (req.body.userID !== 123) {
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
            if (req.body.userID) {
                if (req.body.userID !== 123) {
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