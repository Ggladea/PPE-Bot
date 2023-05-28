module.exports = (sequelize, DataTypes) => {
	const Guild = sequelize.define('Guild', {
		index: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		classDispenserChannelId: {
			type: DataTypes.STRING,
			allowNull: true
		},
		itemSubmissionDispenserChannelId: {
			type: DataTypes.STRING,
			allowNull: true
		},
		itemSubmissionsChannelId: {
			type: DataTypes.STRING,
			allowNull: true
		},
		minimumBotManageRoleId: {
			type: DataTypes.STRING,
			allowNull: true
		},
		guildId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		teamCreationDispenserChannelId: {
			type: DataTypes.STRING,
			allowNull: true
		},
		prefix: {
			type: DataTypes.STRING,
			allowNull: false
		},
		verificationDispenserChannelId: {
			type: DataTypes.STRING,
			allowNull: true
		},
		verificationLogChannelId: {
			type: DataTypes.STRING,
			allowNull: true
		},
		verifiedRoleId: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {})

	Guild.associate = models => {
		Guild.hasOne(models.ClassRoleDispenser)
		Guild.hasOne(models.ItemSubmissionDispenser)
		Guild.hasOne(models.GuildSetupPrompt)
		Guild.hasOne(models.TeamCreationDispenser)
		Guild.hasOne(models.VerificationDispenser)
		
		Guild.hasMany(models.Item)
		Guild.hasMany(models.Team)
		Guild.hasMany(models.Season)
		Guild.hasMany(models.User)
	}

	return Guild
}