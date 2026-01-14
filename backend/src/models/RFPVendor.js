const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RFPVendor = sequelize.define('RFPVendor', {
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
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailStatus: {
    type: DataTypes.ENUM('pending', 'sent', 'failed', 'bounced'),
    defaultValue: 'pending',
    allowNull: false
  }
}, {
  tableName: 'rfp_vendors',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['rfp_id', 'vendor_id']
    }
  ]
});

module.exports = RFPVendor;
