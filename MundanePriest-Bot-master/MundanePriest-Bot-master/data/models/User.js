module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		index: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		className: {
			type: DataTypes.STRING,
			allowNull: true
		},
		cheatingInfractionCount: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		deathCount: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		inGameNameLowerCase: {
			type: DataTypes.STRING,
			allowNull: true
		},
		inGameNameUnchanged: {
			type: DataTypes.STRING,
			allowNull: true
		},
		isExpelled: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		isVerified: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		teamId: {
			type: DataTypes.STRING,
			allowNull: true
		},
		points: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
			//unique: true
		}
	}, {})

	User.associate = models => {
		User.belongsTo(models.Guild)
	}

	return User
}