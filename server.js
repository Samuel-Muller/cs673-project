const express = require('express')
const swaggerUI = require('swagger-ui-express')
const swaggerJSDoc = require('swagger-jsdoc');
const billing = require('./api/v1/routes/billing')
const options = {
    failOnErrors: true,
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Billing and Revenue Management API',
            description: 'API for managing billing and revenue',
            version: '1.0.0',
        },
        servers: [{ url: '/billing' }],
    },
    apis: ['./api/v1/routes/*.js'],
};
const swaggerSpec = swaggerJSDoc(options);
const app = express()
const port = 3000

// Log all requests and responses to the console
app.use((req, res, next) => {
    const date = new Date()
    console.log(date.toISOString() + ' ' + req.ip + ' ' + req.method + ' ' + req.originalUrl)
    next()
})

app.use(express.json())

// Import the billing router
app.use('/billing', billing)

// Serve the Swagger UI
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec))

// Start the server
app.listen(port, () => {
    console.log(`API listening on port ${port}`)
})