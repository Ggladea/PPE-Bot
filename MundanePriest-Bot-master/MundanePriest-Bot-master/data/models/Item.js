module.exports = (sequelize, DataTypes) => {
	const Item = sequelize.define('Item', {
		index: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		longName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		shortName: {
			type: DataTypes.STRING,
			allowNull: true
		},
		archerValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		assassinValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		huntressValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		knightValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		mysticValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		necromancerValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		ninjaValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		paladinValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		priestValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		rogueValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		samuraiValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		sorcererValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		tricksterValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		warriorValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		wizardValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		summonerValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		bardValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		kenseiValue: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
	})

	Item.associate = models => {
		Item.belongsTo(models.Guild)
		Item.hasMany(models.ItemLog)
		Item.hasMany(models.PremiumItem)
	}

	return Item
}