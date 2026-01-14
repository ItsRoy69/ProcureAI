const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RFP = sequelize.define('RFP', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  budget: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  evaluationCriteria: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  specialRequirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'closed'),
    defaultValue: 'draft',
    allowNull: false
  }
}, {
  tableName: 'rfps',
  timestamps: true,
  underscored: true
});

module.exports = RFP;
