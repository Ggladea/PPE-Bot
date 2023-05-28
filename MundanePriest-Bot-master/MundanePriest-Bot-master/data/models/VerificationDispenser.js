module.exports = (sequelize, DataTypes) => {
	const VerificationDispenser = sequelize.define('VerificationDispenser', {
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

	VerificationDispenser.associate = models => {
		VerificationDispenser.belongsTo(models.Guild)
		VerificationDispenser.hasMany(models.VerificationPrompt)
	}

	return VerificationDispenser
}