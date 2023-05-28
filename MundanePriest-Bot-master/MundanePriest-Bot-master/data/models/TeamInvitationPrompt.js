module.exports = (sequelize, DataTypes) => {
    const TeamInvitationPrompt = sequelize.define('TeamInvitationPrompt', {
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

    TeamInvitationPrompt.associate = models => {
        TeamInvitationPrompt.belongsTo(models.TeamCreationDispenser)
    }

    return TeamInvitationPrompt
}