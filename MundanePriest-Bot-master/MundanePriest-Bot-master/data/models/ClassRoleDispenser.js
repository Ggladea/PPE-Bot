module.exports = (sequelize, DataTypes) => {
    const ClassRoleDispenser = sequelize.define('ClassRoleDispenser', {
        index: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        channelId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        messageId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {})

    ClassRoleDispenser.associate = models => {
        ClassRoleDispenser.belongsTo(models.Guild)
        ClassRoleDispenser.hasMany(models.ClassSwitchPrompt)
        ClassRoleDispenser.hasMany(models.Class)
    }

    return ClassRoleDispenser
}