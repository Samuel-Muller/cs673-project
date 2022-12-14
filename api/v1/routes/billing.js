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
*     description: Get all payments
*     parameters:
*       - in: query
*         name: userID
*         schema:
*           description: User ID that is getting payments
*           required: true
*           type: string
*           example:  123
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
*     produces:
*       - application/json
*     description: Create new payment
*     requestBody:
*       description: Payment object
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               userID:
*                 type: integer
*               invoiceID:
*                 type: integer
*               totalAmount:
*                 type: float
*               cardNum:
*                 type: string
*               cardExp:
*                 type: string
*             example:
*               userID: 123
*               invoiceID: 1
*               totalAmount: 100.00
*               cardNum: "1234567890123456"
*               cardExp: "0123"
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
            // Validate if userID is provided
            if (req.query.userID) {
                // Validate if userID is a number
                if (!Number(req.body.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                // Find all payments via Prisma
                prisma.payment.findMany().then((payments) => {
                    // If no payments found, send error
                    if (payments.length === 0) {
                        return res.status(404).send('Payments not found')
                    }
                    // If payments found, send payments
                    return res.status(200).send(payments)
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(400).send('Invalid payment details')
                })
            } else {
                // If no userID provided, send error
                return res.status(400).send('No query parameters provided. Must provide userID in query parameters')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
            return res.status(500).send('Internal server error')
        }
    })
    .post(async (req, res) => {
        try {
            // Validate if userID, invoiceID, totalAmount, cardNum, and cardExp are provided
            if (req.body.userID && req.body.invoiceID && req.body.totalAmount && req.body.cardNum && req.body.cardExp) {
                // Validate if userID, invoiceID, totalAmount, cardNum, and cardExp are numbers
                if (!Number(req.body.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                if (!Number(req.body.invoiceID)) {
                    return res.status(400).send('Invalid invoice ID')
                }
                if (!Number(req.body.totalAmount)) {
                    return res.status(400).send('Invalid total amount')
                }
                if (!Number(req.body.cardNum) || req.body.cardNum.length !== 16) {
                    return res.status(400).send('Invalid card Number')
                }
                // Get current date and time
                let date = new Date()
                // Create new payment via Prisma
                prisma.payment.create({
                    data: {
                        userID: req.body.userID,
                        totalAmount: req.body.totalAmount,
                        invoiceID: req.body.invoiceID,
                        paymentDate: date,
                        insuranceID: 0,
                        cardNum: req.body.cardNum,
                        cardExp: req.body.cardExp,
                    }
                }).then((payment) => {
                    // Update invoice after successful payment
                    prisma.invoice.update({
                        where: {
                            invoiceID: req.body.invoiceID
                        },
                        data: {
                            lastPaymentDate: date,
                            amountPaid: {
                                increment: req.body.totalAmount
                            }
                        }
                    }).then((invoice) => {
                        // Send payment to client
                        return res.status(200).send(payment)
                    }).catch((e) => {
                        // Print error to Render console
                        console.log(e)
                        // Send error to client
                        return res.status(400).send('Could not update invoice after payment')
                    })
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(400).send('Invalid payment details')
                })
            } else {
                // If no userID, invoiceID, totalAmount, cardNum, and cardExp provided, send error
                return res.status(400).send('Invalid body parameters. Must include userID, invoiceID, totalAmount, cardNum, and cardExp')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
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
*       - in: query
*         name: userID
*         schema:
*           description: User ID that is getting payment
*           required: true
*           type: string
*           example: 123
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
*     produces:
*       - application/json
*     requestBody:
*       description: Payment object
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               userID:
*                 type: integer
*               invoiceID:
*                 type: integer
*               totalAmount:
*                 type: float
*               cardNum:
*                 type: string
*               cardExp:
*                 type: string
*             example:
*               userID: 123
*               invoiceID: 1
*               totalAmount: 100.00
*               cardNum: "1234567890123456"
*               cardExp: "0123"
*     parameters:
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
*     requestBody:
*       description: User ID
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               userID:
*                 type: integer
*             example:
*               userID: 123
*     parameters:
*       - in: path
*         name: payment_id
*         schema:
*           description: Payment ID that is being deleted
*           required: true
*           type: string
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
            // Check if userID and payment_id are provided
            if (req.query.userID && req.params.payment_id) {
                // Check if userID and payment_id are numbers
                if (!Number(req.params.payment_id)) {
                    return res.status(400).send('Invalid payment ID')
                }
                if (!Number(req.body.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                // Find payment
                prisma.payment.findUnique({
                    where: {
                        paymentID: Number(req.params.payment_id)
                    }
                }).then((payment) => {
                    // Check if payment exists
                    if (!payment) {
                        return res.status(404).send('Payment not found')
                    }
                    // Send payment
                    return res.status(200).send(payment)
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(400).send('Invalid payment details')
                })
            } else {
                // If no userID and payment_id provided, send error
                return res.status(400).send('No query or path parameters. Must include userID in query and payment_id in path')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
            return res.status(500).send('Internal server error')
        }
    })
    .put(async (req, res) => {
        try {
            // Check if userID, invoiceID, totalAmount, cardNum, cardExp, and payment_id are provided
            if (req.body.userID && req.body.totalAmount && req.body.cardNum && req.body.cardExp && req.params.payment_id) {
                // Check if userID, invoiceID, totalAmount, cardNum, cardExp, and payment_id are numbers
                if (!Number(req.params.payment_id)) {
                    return res.status(400).send('Invalid payment ID')
                }
                if (!Number(req.body.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                if (!Number(req.body.invoiceID)) {
                    return res.status(400).send('Invalid invoice ID')
                }
                if (!Number(req.body.totalAmount)) {
                    return res.status(400).send('Invalid total amount')
                }
                if (!Number(req.body.cardNum) || req.body.cardNum.length !== 16) {
                    return res.status(400).send('Invalid card Number')
                }
                // Get current date and time
                let date = new Date()
                // Update payment
                prisma.payment.update({
                    where: {
                        paymentID: Number(req.params.payment_id)
                    },
                    data: {
                        userID: req.body.userID,
                        totalAmount: req.body.totalAmount,
                        insuranceID: 0,
                        cardNum: req.body.cardNum,
                        cardExp: req.body.cardExp,
                    }
                }).then((payment) => {
                    // Update invoice after updating payment
                    prisma.invoice.update({
                        where: {
                            invoiceID: req.body.invoiceID
                        },
                        data: {
                            lastPaymentDate: date,
                            amountPaid: {
                                increment: req.body.totalAmount
                            }
                        }
                    }).then((invoice) => {
                        // Send updated payment
                        return res.status(200).send(payment)
                    }).catch((e) => {
                        // Print error to Render console
                        console.log(e)
                        // Send error to client
                        return res.status(400).send('Could not update invoice after payment')
                    })
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(400).send('Invalid payment details')
                })
            } else {
                // If no userID, invoiceID, totalAmount, cardNum, cardExp, and payment_id provided, send error
                return res.status(400).send('No body parameters. Must include userID, invoiceID, totalAmount, cardNum, and cardExp in body')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
            return res.status(500).send('Internal server error')
        }

    })
    .delete(async (req, res) => {
        try {
            // Check if userID and payment_id are provided
            if (req.body.userID && req.params.payment_id) {
                // Check if userID and payment_id are numbers
                if (!Number(req.params.payment_id)) {
                    return res.status(400).send('Invalid payment ID')
                }
                if (!Number(req.body.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                // Delete payment
                prisma.payment.delete({
                    where: {
                        paymentID: Number(req.params.payment_id)
                    }
                }).then((payment) => {
                    // update invoice after updating payment
                    // prisma.invoice.update({
                    //     where: {
                    //         invoiceID: req.body.invoiceID
                    //     },
                    //     data: {
                    //         lastPaymentDate: date,
                    //         //last_payment_amount: req.body.totalAmount,
                    //         amountPaid: {
                    //             decrement: req.body.totalAmount
                    //         }
                    //     }
                    return res.status(200).send('Payment deleted')
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(400).send('Invalid payment ID')
                })
            } else {
                // If no userID and payment_id provided, send error
                return res.status(400).send('No body or path parameters. Must include userID in body and payment_id in path')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
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
*       - in: query
*         name: userID
*         schema:
*           description: User ID that is getting invoices
*           required: true
*           type: integer
*           example: 123
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
*     produces:
*       - application/json
*     requestBody:
*       description: Invoice object
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               userID:
*                 type: integer
*               payerID:
*                 type: integer
*               invoiceTitle:
*                 type: string
*               diagnosis:
*                 type: string
*               totalAmount:
*                 type: float
*               minimumDue:
*                 type: float
*               dueDate:
*                 type: string
*               icd10:
*                 type: string
*             example:
*               userID: 123
*               payerID: 203
*               invoiceTitle: "Invoice 1"
*               diagnosis: "Diagnosis 1"
*               totalAmount: 100.00
*               minimumDue: 50.00
*               dueDate: "01/10/2023"
*               icd10: "['A0.01', 'B0.02']"
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
            // Check if userID is provided
            if (req.query.userID) {
                // Check if userID is a number
                if (!Number(req.query.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                // Get all invoices
                prisma.invoice.findMany().then((invoices) => {
                    // Check if invoices exist
                    if (invoices.length === 0) {
                        return res.status(404).send('Invoices not found')
                    }
                    // Send invoices to client
                    return res.status(200).send(invoices)
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(400).send('Invalid invoice details')
                })
            } else {
                // If no userID provided, send error
                return res.status(401).send('No query parameters. Must include userID in query')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
            return res.status(500).send('Internal server error')
        }
    })
    .post(async (req, res) => {
        try {
            // Check if userID, invoiceTitle, diagnosis, totalAmount, minimumDue, dueDate, icd10, and payerID are provided
            if (req.body.userID && req.body.invoiceTitle && req.body.diagnosis && req.body.totalAmount && req.body.minimumDue && req.body.dueDate && req.body.icd10 && req.body.payerID) {
                // Check if userID, invoiceTitle, diagnosis, totalAmount, minimumDue, dueDate, icd10, and payerID are numbers
                if (!Number(req.body.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                if (!Number(req.body.userID)) {
                    return res.status(400).send('Invalid payer ID')
                }
                if (!Number(req.body.totalAmount)) {
                    return res.status(400).send('Invalid total amount')
                }
                if (!Number(req.body.minimumDue)) {
                    return res.status(400).send('Invalid minimum due amount')
                }
                // Get current date
                let date = new Date()
                // Parse due date
                var parsedDueDate = Date.parse(req.body.dueDate);
                var dueDate = new Date(parsedDueDate);
                // Create invoice
                prisma.invoice.create({
                    data: {
                        userID: req.body.userID,
                        payerID: req.body.payerID,
                        insuranceID: 0,
                        invoiceTitle: req.body.invoiceTitle,
                        invoiceDate: date,
                        diagnosis: req.body.diagnosis,
                        totalAmount: Number(req.body.totalAmount),
                        dueDate: dueDate,
                        minimumDue: Number(req.body.minimumDue),
                        amountPaid: 0,
                        lastPaymentDate: null,
                        approved: 0,
                        icd10: JSON.stringify(req.body.icd10)
                    }
                }).then((invoice) => {
                    // Send invoice to client
                    return res.status(200).send(invoice)
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(400).send('Invalid invoice details')
                })
            } else {
                // If no userID, invoiceTitle, diagnosis, totalAmount, minimumDue, dueDate, icd10, and payerID provided, send error
                return res.status(400).send('No body parameters. Must include userID, payerID, invoiceTitle, diagnosis, totalAmount, minimumDue, dueDate, and icd10 in body')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
            return res.status(500).send('Internal server error')
        }
    })

/**
* @openapi
* /invoices/search/icd10:
*   get:
*     tags:
*       - Invoices
*     produces:
*       - application/json
*     description: ICD-10 invoice search
*     parameters:
*       - in: query
*         name: userID
*         schema:
*           description: User ID that is searching invoices
*           required: true
*           type: string
*           example: 123
*       - in: query
*         name: icd10
*         schema:
*           description: ICD-10 search term
*           required: true
*           type: string
*           example: "J06.9"
*     responses:
*       200:
*         description: Returns invoices details
*       400:
*         description: Invalid search details
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to access invoice details
*       404:
*         description: Invoice not found
*       500:
*         description: Internal server error
*/
router.route('/invoices/search/icd10')
    .get(async (req, res) => {
        try {
            // Check if userID and icd10 are provided
            if (req.query.userID && req.query.icd10) {
                // Check if userID is a number
                if (!Number(req.query.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                // Get invoices
                prisma.invoice.findMany({
                    where: {
                        icd10: {
                            contains: req.query.icd10
                        }
                    },
                }).then((invoices) => {
                    // Send invoices to client
                    return res.status(200).send(invoices)
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(404).send('Invoices not found')
                })
            } else {
                // If no userID and icd10 provided, send error
                return res.status(400).send('No query parameters. Must include userID and icd10 search term in query')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
            return res.status(500).send('Internal server error')
        }
    })

/**
* @openapi
* /invoices/search/diagnosis:
*   get:
*     tags:
*       - Invoices
*     produces:
*       - application/json
*     description: Diagnosis invoice search
*     parameters:
*       - in: query
*         name: userID
*         schema:
*           description: User ID that is searching invoice
*           required: true
*           type: string
*           example: 123
*       - in: query
*         name: diagnosis
*         schema:
*           description: Diagnosis search term
*           required: true
*           type: string
*           example: "cough"
*     responses:
*       200:
*         description: Returns invoices details
*       400:
*         description: Invalid search details
*       401:
*         description: Client not authorized
*       403:
*         description: User is not authorized to access invoice details
*       404:
*         description: Invoice not found
*       500:
*         description: Internal server error
*/
router.route('/invoices/search/diagnosis')
    .get(async (req, res) => {
        try {
            // Check if userID and diagnosis are provided
            if (req.query.userID && req.query.diagnosis) {
                // Check if userID is a number
                if (!Number(req.query.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                // Get invoices
                prisma.invoice.findMany({
                    where: {
                        diagnosis: {
                            contains: req.query.diagnosis
                        }
                    },
                }).then((invoices) => {
                    // Send invoices to client
                    return res.status(200).send(invoices)
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(404).send('Invoices not found')
                })
            } else {
                // If no userID and diagnosis provided, send error
                return res.status(400).send('No query parameters. Must include userID and diagnosis search term in query')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
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
*       - in: query
*         name: userID
*         schema:
*           description: User ID that is getting invoice
*           required: true
*           type: string
*           example: 123
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
*     produces:
*       - application/json
*     description: Update invoice details
*     requestBody:
*       description: Invoice object
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               userID:
*                 type: integer
*               payerID:
*                 type: integer
*               invoiceTitle:
*                 type: string
*               diagnosis:
*                 type: string
*               totalAmount:
*                 type: float
*               icd10:
*                 type: string
*               minimumDue:
*                 type: float
*               dueDate:
*                 type: string
*               invoiceDate:
*                 type: string
*               amountPaid:
*                 type: float
*             example:
*               userID: 123
*               payerID: 203
*               invoiceTitle: "Invoice 1"
*               diagnosis: "Cough"
*               totalAmount: 100.00
*               minimumDue: 50.00
*               dueDate: "01/10/2023"
*               invoiceDate: "01/01/2021"
*               amountPaid: 50.00
*               icd10: "['J20.9']"
*     parameters:
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
*     produces:
*       - application/json
*     description: Delete invoice by ID
*     requestBody:
*       description: User ID
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               userID:
*                 type: integer
*             example:
*               userID: 123
*     parameters:
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
            // Check if userID and invoice_id are provided
            if (req.query.userID && req.params.invoice_id) {
                // Check if userID and invoice_id are numbers
                if (!Number(req.params.invoice_id)) {
                    return res.status(400).send('Invalid invoice ID')
                }
                if (!Number(req.query.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                // Get invoice details
                prisma.invoice.findUnique({
                    where: {
                        invoiceID: Number(req.params.invoice_id)
                    }
                }).then((invoice) => {
                    // Check if invoice exists
                    if (!invoice) {
                        return res.status(404).send('Invoice not found')
                    }
                    // Send invoice details to client
                    return res.status(200).send(invoice)
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(400).send('Invalid invoice details')
                })
            } else {
                // Send error to client
                return res.status(400).send('No query parameters. Must include userID and invoice_id in query')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
            return res.status(500).send('Internal server error')
        }
    })
    .put(async (req, res) => {
        try {
            // Check if userID, payerID, invoiceTitle, diagnosis, totalAmount, dueDate, miniumDue, and invoice_id are provided
            if (req.body.userID && req.body.payerID && req.body.invoiceTitle && req.body.diagnosis && req.body.totalAmount && req.body.dueDate && req.body.minimumDue && req.params.invoice_id) {
                // Check if userID, payerID, totalAmount, miniumDue, and invoice_id are numbers
                if (!Number(req.params.invoice_id)) {
                    return res.status(400).send('Invalid invoice ID')
                }
                if (!Number(req.query.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                if (!Number(req.body.totalAmount)) {
                    return res.status(400).send('Invalid total amount')
                }
                if (!Number(req.body.minimumDue)) {
                    return res.status(400).send('Invalid minimum due amount')
                }
                // Get current date and time
                let date = new Date()
                // Parse due date
                var parsedDueDate = Date.parse(req.body.dueDate);
                var dueDate = new Date(parsedDueDate);
                // Update invoice details
                prisma.invoice.update({
                    where: {
                        invoiceID: Number(req.params.invoice_id)
                    },
                    data: {
                        userID: req.body.userID,
                        payerID: req.body.payerID,
                        insuranceID: 0,
                        invoiceTitle: req.body.invoiceTitle,
                        invoiceDate: date,
                        diagnosis: req.body.diagnosis,
                        totalAmount: req.body.totalAmount,
                        dueDate: dueDate,
                        minimumDue: req.body.minimumDue,
                        amountPaid: req.body.amountPaid,
                        icd10: JSON.stringify(req.body.icd10)
                    }
                }).then((invoice) => {
                    // Check if invoice exists
                    return res.status(200).send(invoice)
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(400).send('Invalid invoice details')
                })
            } else {
                // Send error to client if parameters are missing
                return res.status(400).send('Incorrect body or path parameters. Must include userID, payerID, invoiceTitle, diagnosis, totalAmount, dueDate, minimumDue, and amountPaid in body and invoice_id in path')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
            return res.status(500).send('Internal server error')
        }
    })
    .delete(async (req, res) => {
        try {
            // Check if userID and invoice_id are provided
            if (req.body.userID && req.params.invoice_id) {
                // Check if userID and invoice_id are numbers
                if (!Number(req.params.invoice_id)) {
                    return res.status(400).send('Invalid invoice ID')
                }
                if (!Number(req.query.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                // Delete invoice
                prisma.invoice.delete({
                    where: {
                        invoiceID: Number(req.params.invoice_id)
                    }
                }).then((invoice) => {
                    // Send success message to client
                    return res.status(200).send('Invoice deleted')
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(404).send('Invoice not found')
                })
            } else {
                // Send error to client if parameters are missing
                return res.status(400).send('Incorrect body or path parameters. Must include userID in body and invoice_id in path')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
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
*       - in: query
*         name: userID
*         schema:
*           description: User ID that is approving invoice
*           required: true
*           type: string
*           example: 123
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
            // Check if userID and invoice_id are provided
            if (req.body.userID && req.params.invoice_id) {
                // Check if userID and invoice_id are numbers
                if (!Number(req.query.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                if (!Number(req.params.invoice_id)) {
                    return res.status(400).send('Invalid invoice ID')
                }
                // Approve invoice
                prisma.invoice.update({
                    where: {
                        invoiceID: Number(req.params.invoice_id)
                    },
                    data: {
                        approved: 1
                    }
                }).then((invoice) => {
                    // Sendd invoice details to client
                    return res.status(200).send(invoice)
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(404).send('Invoice not found')
                })
            } else {
                // Send error to client if parameters are missing
                return res.status(400).send('No body or path parameters. Must include userID in body and invoice_id in path')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
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
*     parameters:
*       - in: query
*         name: userID
*         schema:
*           description: User ID that is creating report
*           required: true
*           type: string
*           example: 123
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
*     produces:
*       - application/json
*     description: Create new report
*     requestBody:
*       description: Report object
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               userID:
*                 type: integer
*               startDate:
*                 type: string
*               endDate:
*                 type: string
*             example:
*               userID: 123
*               startDate: "01/01/2022"
*               endDate: "12/31/2022"
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
    .get(async (req, res) => {
        try {
            // Check if userID is provided
            if (req.query.userID) {
                // Check if userID is a number
                if (!Number(req.query.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                // Get all reports
                prisma.reports.findMany().then((reports) => {
                    // Check if reports exist
                    if (!reports) {
                        return res.status(404).send('Reports not found')
                    }
                    // Send reports to client
                    return res.status(200).send(reports)
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(404).send('Reports not found')
                })
            } else {
                // Send error to client if parameters are missing
                return res.status(400).send('No query parameters. Must include userID in query')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
            return res.status(500).send('Internal server error')
        }
    })
    .post(async (req, res) => {
        try {
            // Check if userID, startDate, and endDate are provided
            if (req.body.userID && req.body.startDate && req.body.endDate) {
                // Check if userID is a number
                if (!Number(req.query.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                // Parse start and end dates
                var parsedStartDate = Date.parse(req.body.startDate);
                var startDate = new Date(parsedStartDate);
                var parsedEndDate = Date.parse(req.body.endDate);
                var endDate = new Date(parsedEndDate)
                // Get all payments between start and end dates
                prisma.payment.findMany({
                    where: {
                        paymentDate: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                }).then((payments) => {
                    // Check if payments exist
                    if (!payments) {
                        return res.status(404).send('No payments found')
                    }
                    // Calculate total balance and gather payment IDs
                    let paymentIDs = []
                    let totalBalance = 0.0
                    payments.forEach((payment) => {
                        paymentIDs.push(payment.paymentID)
                        totalBalance += payment.totalAmount
                    })
                    // Create report
                    prisma.reports.create({
                        data: {
                            startDate: startDate,
                            endDate: endDate,
                            totalBalance: totalBalance,
                            paymentIDs: JSON.stringify(paymentIDs)
                        }
                    }).then((report) => {
                        // Send report to client
                        return res.status(200).send(report)
                    }).catch((e) => {
                        // Print error to Render console
                        console.log(e)
                        // Send error to client
                        return res.status(404).send('Report not created')
                    })
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(404).send('Could not find payments')
                })
            } else {
                // Send error to client if parameters are missing
                return res.status(400).send('Invalid body. Must include userID, startDate, and endDate in body.')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
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
*     parameters:
*       - in: query
*         name: userID
*         schema:
*           description: User ID that is getting report
*           required: true
*           type: string
*           example: 123
*       - in: path
*         name: report_id
*         schema:
*           description: Report ID to retrieve
*           required: true
*           type: string
*           example: 1
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
*     produces:
*       - application/json
*     description: Update report by ID
*     requestBody:
*       description: Report object
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               userID:
*                 type: integer
*               startDate:
*                 type: string
*               endDate:
*                 type: string
*               paymentID:
*                 type: string
*             example:
*               userID: 123
*               startDate: "01/01/2022"
*               endDate: "12/31/2022"
*               paymentID: "[1,2,3]"
*     parameters:
*       - in: path
*         name: report_id
*         schema:
*           description: Report ID to update
*           required: true
*           type: string
*           example: 1
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
*     produces:
*       - application/json
*     description: Delete report by ID
*     requestBody:
*       description: User ID
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               userID:
*                 type: integer
*             example:
*               userID: 123
*     parameters:
*       - in: path
*         name: report_id
*         schema:
*           description: Report ID to delete
*           required: true
*           type: string
*           example: 1
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
            // Check if user ID and report ID are valid
            if (req.query.userID && req.params.report_id) {
                // Check if user ID and report ID are numbers
                if (!Number(req.params.report_id)) {
                    return res.status(400).send('Invalid report ID')
                }
                if (!Number(req.query.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                // Get reports
                prisma.reports.findUnique({
                    where: {
                        reportID: Number(req.params.report_id)
                    }
                }).then((report) => {
                    // Check if report exists
                    if (!report) {
                        return res.status(404).send('Report not found')
                    }
                    // Send report to client
                    return res.status(200).send(report)
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(404).send('Report not found')
                })
            } else {
                // Send error to client if parameters are missing
                return res.status(400).send('Invalid query or path parameters. Must include userID in query and report_id in path')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
            return res.status(500).send('Internal server error')
        }
    })
    .put((req, res) => {
        try {
            // Check if user ID, report ID, start date, and end date are valid
            if (req.body.userID && req.body.startDate && req.body.endDate && req.params.report_id) {
                // Check if user ID and report_id are numbers
                if (!Number(req.query.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                if (!Number(req.params.report_id)) {
                    return res.status(400).send('Invalid report ID')
                }
                // Parse start and end dates
                var parsedStartDate = Date.parse(req.body.startDate);
                var startDate = new Date(parsedStartDate);
                var parsedEndDate = Date.parse(req.body.endDate);
                var endDate = new Date(parsedEndDate)
                // Find payments between start and end dates
                prisma.payment.findMany({
                    where: {
                        paymentDate: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                }).then((payments) => {
                    // Check if payments exist
                    if (!payments) {
                        return res.status(404).send('No payments found for report')
                    }
                    // Calculate total balance and gather payment IDs
                    let paymentIDs = []
                    let totalBalance = 0.0
                    payments.forEach((payment) => {
                        paymentIDs.push(payment.paymentID)
                        totalBalance += payment.totalAmount
                    })
                    // Update report
                    prisma.reports.update({
                        where: {
                            reportID: Number(req.params.report_id)
                        },
                        data: {
                            startDate: startDate,
                            endDate: endDate,
                            totalBalance: totalBalance,
                            paymentIDs: JSON.stringify(paymentIDs)
                        }
                    }).then((report) => {
                        // Send report to client
                        return res.status(200).send(report)
                    }).catch((e) => {
                        // Print error to Render console
                        console.log(e)
                        // Send error to client
                        return res.status(404).send('Report not updated')
                    })
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(404).send('Could not find payments to create report')
                })
            } else {
                // Send error to client if parameters are missing
                return res.status(400).send('Invalid body or path parameters. Must include userID in body, startDate in body, endDate in body, and report_id in path')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
            return res.status(500).send('Internal server error')
        }

    })
    .delete((req, res) => {
        try {
            // Check if user ID and report ID are valid
            if (req.body.userID && req.params.report_id) {
                // Check if user ID and report_id are numbers
                if (!Number(req.query.userID)) {
                    return res.status(400).send('Invalid user ID')
                }
                if (!Number(req.params.report_id)) {
                    return res.status(400).send('Invalid report ID')
                }
                // Delete report
                prisma.reports.delete({
                    where: {
                        reportID: Number(req.params.report_id)
                    }
                }).then((report) => {
                    // Send success to client
                    return res.status(200).send("Report deleted")
                }).catch((e) => {
                    // Print error to Render console
                    console.log(e)
                    // Send error to client
                    return res.status(404).send('Report not deleted')
                })
            } else {
                // Send error to client if parameters are missing
                return res.status(400).send('Invalid body or path parameters. Must include userID in body and report_id in path')
            }
        } catch (e) {
            // Print error to Render console
            console.log(e)
            // Send error to client
            return res.status(500).send('Internal server error')
        }
    })

module.exports = router