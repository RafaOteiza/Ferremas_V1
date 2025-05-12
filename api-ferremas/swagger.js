const yaml = require('yamljs');

const swaggerSpec = yaml.load('./docs/swagger.yaml');

module.exports = swaggerSpec;
