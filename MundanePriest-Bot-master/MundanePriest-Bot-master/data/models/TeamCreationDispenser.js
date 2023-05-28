module.exports = (sequelize, DataTypes) => {
    const TeamCreationDispenser = sequelize.define('TeamCreationDispenser', {
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

    TeamCreationDispenser.associate = models => {
        TeamCreationDispenser.belongsTo(models.Guild)
        
        TeamCreationDispenser.hasMany(models.TeamCreationPrompt)
        TeamCreationDispenser.hasMany(models.TeamInvitationPrompt)
        TeamCreationDispenser.hasMany(models.TeamKickPrompt)
    }

    return TeamCreationDispenser
}