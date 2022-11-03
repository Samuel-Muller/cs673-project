const express = require('express')
const billing = require('./api/v1/routes/billing')
const swaggerUI = require('swagger-ui-express')
const swaggerJSDoc = require('swagger-jsdoc');
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Billing and Revenue Management API',
            version: '1.0.0',
        },
        basePath: '/api/v1'
    },
    apis: ['./api/v1/routes/*.js'],
};
const swaggerSpec = swaggerJSDoc(options);
const app = express()
const port = 3000

// Import the billing router
app.use('/api/v1/billing', billing)

// Log all requests and responses to the console
app.use((req, res, next) => {
    const date = new Date()
    console.log(date.toISOString() + ' ' + req.ip + ' ' + req.method + ' ' + req.originalUrl)
    next()
})


// Serve the Swagger UI
app.use('/api/v1/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec))

// Start the server
app.listen(port, () => {
    console.log(`API listening on port ${port}`)
})