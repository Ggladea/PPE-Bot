module.exports = (sequelize, DataTypes) => {
	const ItemSubmissionDispenser = sequelize.define('ItemSubmissionDispenser', {
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
        }
    }, {})

	ItemSubmissionDispenser.associate = models => {
		ItemSubmissionDispenser.belongsTo(models.Guild)
        ItemSubmissionDispenser.hasMany(models.ItemSubmissionPrompt)
        ItemSubmissionDispenser.hasMany(models.PendingItemSubmissionPrompt)
	}

	return ItemSubmissionDispenser
}