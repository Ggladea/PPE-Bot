module.exports = (sequelize, DataTypes) => {
    const TeamCreationPrompt = sequelize.define('TeamCreationPrompt', {
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
		guildId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {})

    TeamCreationPrompt.associate = models => {
        TeamCreationPrompt.belongsTo(models.TeamCreationDispenser)
    }

    return TeamCreationPrompt
}