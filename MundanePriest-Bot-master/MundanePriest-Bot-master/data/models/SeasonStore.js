module.exports = (sequelize, DataTypes) => {
    const SeasonStore = sequelize.define('SeasonStore', {
        index: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        seasonId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {})

    SeasonStore.associate = models => {
        SeasonStore.belongsTo(models.Season)
    }

    return SeasonStore
}