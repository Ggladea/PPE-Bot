module.exports = (sequelize, DataTypes) => {
    const ItemSubmissionPrompt = sequelize.define('ItemSubmissionPrompt', {
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
			defaultValue: 600
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {})

    ItemSubmissionPrompt.associate = models => {
		ItemSubmissionPrompt.belongsTo(models.ItemSubmissionDispenser)
    }

    return ItemSubmissionPrompt
}