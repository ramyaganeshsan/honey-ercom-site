const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('company_domain', {
    domain_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    opportunity_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    create_user: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    org_password: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    company_name: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    company_domain: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    company_email: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    oppo_product: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    free_trial: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    project_version: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    time_zone: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    country: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    telephone_code: {
      type: DataTypes.STRING(8),
      allowNull: false
    },
    driverpassword: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    create_date: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    expiry_date: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    domain_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    mobileauthcode: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    modified_date: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    modified_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    DatabaseUsername: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    DatabasePassword: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type_completed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    instanceID: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    DBtype: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    PublicIP: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    Status: {
      type: DataTypes.STRING(64),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'company_domain',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "domain_id" },
        ]
      },
      {
        name: "domain_id",
        using: "BTREE",
        fields: [
          { name: "domain_id" },
          { name: "create_user" },
          { name: "company_name" },
          { name: "company_domain" },
          { name: "company_email" },
          { name: "mobile" },
        ]
      },
    ]
  });
};
