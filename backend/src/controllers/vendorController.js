const { Vendor, RFP, Proposal } = require('../models');


async function createVendor(req, res) {
  try {
    const { name, email, contactPerson, phone, companyInfo } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    const existingVendor = await Vendor.findOne({ where: { email } });
    if (existingVendor) {
      return res.status(409).json({
        success: false,
        error: 'Vendor with this email already exists'
      });
    }

    const vendor = await Vendor.create({
      name,
      email,
      contactPerson,
      phone,
      companyInfo
    });

    res.status(201).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


async function getAllVendors(req, res) {
  try {
    const vendors = await Vendor.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: vendors
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


async function getVendorById(req, res) {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findByPk(id, {
      include: [
        {
          model: RFP,
          as: 'rfps',
          through: { attributes: ['sentAt', 'emailStatus'] }
        },
        {
          model: Proposal,
          as: 'proposals'
        }
      ]
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


async function updateVendor(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const vendor = await Vendor.findByPk(id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    if (updateData.email && updateData.email !== vendor.email) {
      const existingVendor = await Vendor.findOne({ where: { email: updateData.email } });
      if (existingVendor) {
        return res.status(409).json({
          success: false,
          error: 'Another vendor with this email already exists'
        });
      }
    }

    await vendor.update(updateData);

    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


async function deleteVendor(req, res) {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findByPk(id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    await vendor.destroy();

    res.json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor
};
