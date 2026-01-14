const { sequelize } = require('../config/database');
const RFP = require('./RFP');
const Vendor = require('./Vendor');
const Proposal = require('./Proposal');
const RFPVendor = require('./RFPVendor');

// Define associations
RFP.belongsToMany(Vendor, {
  through: RFPVendor,
  foreignKey: 'rfpId',
  otherKey: 'vendorId',
  as: 'vendors'
});

Vendor.belongsToMany(RFP, {
  through: RFPVendor,
  foreignKey: 'vendorId',
  otherKey: 'rfpId',
  as: 'rfps'
});

RFP.hasMany(Proposal, {
  foreignKey: 'rfpId',
  as: 'proposals'
});

Proposal.belongsTo(RFP, {
  foreignKey: 'rfpId',
  as: 'rfp'
});

Vendor.hasMany(Proposal, {
  foreignKey: 'vendorId',
  as: 'proposals'
});

Proposal.belongsTo(Vendor, {
  foreignKey: 'vendorId',
  as: 'vendor'
});

RFPVendor.belongsTo(RFP, {
  foreignKey: 'rfpId'
});

RFPVendor.belongsTo(Vendor, {
  foreignKey: 'vendorId'
});

module.exports = {
  sequelize,
  RFP,
  Vendor,
  Proposal,
  RFPVendor
};
