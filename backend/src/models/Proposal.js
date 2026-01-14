const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Proposal = sequelize.define('Proposal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rfpId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rfps',
      key: 'id'
    }
  },
  vendorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vendors',
      key: 'id'
    }
  },
  pricing: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  totalCost: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  paymentTerms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deliveryTimeline: {
    type: DataTypes.STRING,
    allowNull: true
  },
  warranty: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specialConditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rawEmailContent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parsedData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  aiScore: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  aiAnalysis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'accepted', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  receivedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'proposals',
  timestamps: true,
  underscored: true
});

module.exports = Proposal;
