module.exports = (sequelize, DataTypes) => {
	const GuildSetupPrompt = sequelize.define('GuildSetupPrompt', {
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

	GuildSetupPrompt.associate = models => {
		GuildSetupPrompt.belongsTo(models.Guild)
	}

	return GuildSetupPrompt
}