module.exports = (sequelize, DataTypes) => {
    const ItemLog = sequelize.define('ItemLog', {
        index: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        multiplier: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        itemLongName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        recipientId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        seasonIndex: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        verifierId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })

    return ItemLog
}