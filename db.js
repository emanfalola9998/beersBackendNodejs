const { Sequelize } = require('sequelize');

// Update these with your actual credentials
const sequelize = new Sequelize('BeersDB', 'beersuser', 'Rooney98@', {
  host: 'localhost',
  dialect: 'mysql'
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = sequelize;
