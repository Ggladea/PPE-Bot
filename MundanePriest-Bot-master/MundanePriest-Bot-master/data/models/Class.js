module.exports = (sequelize, DataTypes) => {
	const Class = sequelize.define('Class', {
		index: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
        name: {
            type: DataTypes.STRING,
			allowNull: false,
			unique: true
        },
        emojiId: {
            type: DataTypes.STRING,
			allowNull: false,
			unique: true
        }
	}, {})

	Class.associate = models => {
		Class.belongsTo(models.ClassRoleDispenser)
	}

	return Class
}