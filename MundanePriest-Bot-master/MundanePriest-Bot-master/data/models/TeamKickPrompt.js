module.exports = (sequelize, DataTypes) => {
    const TeamKickPrompt = sequelize.define('TeamKickPrompt', {
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

    TeamKickPrompt.associate = models => {
        TeamKickPrompt.belongsTo(models.TeamCreationDispenser)
    }

    return TeamKickPrompt
}