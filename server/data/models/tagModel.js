const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const Tag = sequelize.define('tag', {
	id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
	category: { type: DataTypes.STRING, unique: true },
	publicationCount: { type: DataTypes.INTEGER },
})

module.exports = Tag
