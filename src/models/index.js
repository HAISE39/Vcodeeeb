const sequelize = require('../config/database');
const User = require('./User');
const Script = require('./Script');
const ScriptVersion = require('./ScriptVersion');

User.hasMany(Script, { foreignKey: 'createdBy' });
Script.belongsTo(User, { foreignKey: 'createdBy' });

Script.hasMany(ScriptVersion, { foreignKey: 'scriptId', onDelete: 'CASCADE' });
ScriptVersion.belongsTo(Script, { foreignKey: 'scriptId' });

module.exports = {
  sequelize,
  User,
  Script,
  ScriptVersion
};
