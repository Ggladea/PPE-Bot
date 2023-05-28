module.exports = (sequelize, DataTypes) => {
	const ClassSwitchPrompt = sequelize.define('ClassSwitchPrompt', {
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
		timeLeft: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 60
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {})

	ClassSwitchPrompt.associate = models => {
		ClassSwitchPrompt.belongsTo(models.ClassRoleDispenser)
	}

	return ClassSwitchPrompt
}