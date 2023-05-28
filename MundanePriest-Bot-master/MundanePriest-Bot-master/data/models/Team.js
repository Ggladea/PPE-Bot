module.exports = (sequelize, DataTypes) => {
	const Team = sequelize.define('Team', {
		index: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		isMatchmakingEnabled: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		teamName: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		teamNameUnchanged: {
			type: DataTypes.STRING,
			allowNull: false
		},
		teamLeaderId: {
			type: DataTypes.STRING,
			allowNull: false
		},
}, {})

	Team.associate = models => {
		Team.belongsTo(models.Guild)
		Team.hasMany(models.TeamInvite)
	}

	return Team
}