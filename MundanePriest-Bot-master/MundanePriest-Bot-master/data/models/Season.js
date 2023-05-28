module.exports = (sequelize, DataTypes) => {
	const Season = sequelize.define('Season', {
		index: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		classPairs: {
			type: DataTypes.STRING,
			allowNull: true
		},
		maxMemberCount: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		isEnded: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		isStarted: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		teamsEnabled: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
	})

	Season.associate = models => {
		Season.belongsTo(models.Guild)
		Season.hasOne(models.SeasonStore)
	}

	return Season
}