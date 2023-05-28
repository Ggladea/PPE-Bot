module.exports = (sequelize, DataTypes) => {
	const TeamInvite = sequelize.define('TeamInvite', {
		index: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		messageId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		guildId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		teamId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		timeLeft: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 86400
		},
		recipientId: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {})

	TeamInvite.associate = models => {
		TeamInvite.belongsTo(models.Team)
	}

	return TeamInvite
}