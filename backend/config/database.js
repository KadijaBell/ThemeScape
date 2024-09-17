const config = require('./index');

module.exports = {
  development: {
    dialect: "sqlite",
    storage: config.dbFile,
    seederStorage: "sequelize",
    logQueryParameters: true,
    typeValidation: true,
    logging: console.log
  },

  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    seederStorage: 'sequelize',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      schema: process.env.SCHEMA,
      // underscored: true
    }
  }
};
