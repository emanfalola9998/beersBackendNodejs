const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Beer = sequelize.define('Beer', {
  name: { type: DataTypes.STRING, allowNull: false },
  first_brewed: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  image_url: { type: DataTypes.STRING },
  abv: { type: DataTypes.FLOAT },
  ph: { type: DataTypes.FLOAT },
}, {
  timestamps: false,
});

module.exports = Beer;
