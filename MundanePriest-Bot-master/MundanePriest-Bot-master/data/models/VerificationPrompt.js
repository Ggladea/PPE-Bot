module.exports = (sequelize, DataTypes) => {
    const VerificationPrompt = sequelize.define('VerificationPrompt', {
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
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {})

    VerificationPrompt.associate = models => {
        VerificationPrompt.belongsTo(models.VerificationDispenser)
    }

    return VerificationPrompt
}