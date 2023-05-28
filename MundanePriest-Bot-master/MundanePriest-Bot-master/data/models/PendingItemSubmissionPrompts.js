module.exports = (sequelize, DataTypes) => {
    const PendingItemSubmissionPrompt = sequelize.define('PendingItemSubmissionPrompt', {
		index: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		channelId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		deathCount: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		messageId: {
			type: DataTypes.STRING,
			allowNull: false
        },
        itemLongName: {
            type: DataTypes.STRING,
            allowNull: true
        },
		userId: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {})

    PendingItemSubmissionPrompt.associate = models => {
        PendingItemSubmissionPrompt.belongsTo(models.ItemSubmissionDispenser)
    }

    return PendingItemSubmissionPrompt
}