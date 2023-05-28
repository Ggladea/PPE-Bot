module.exports = (sequelize, DataTypes) => {
	const PremiumItem = sequelize.define('PremiumItem', {
		index: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		multiplier: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {})

	PremiumItem.associate = models => {
		PremiumItem.belongsTo(models.Item)
	}

	return PremiumItem
}