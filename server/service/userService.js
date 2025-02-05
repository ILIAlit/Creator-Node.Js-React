const bcrypt = require('bcrypt')
const generateToken = require('./tokenService')
const UserDto = require('../dtos/userDto')
const tokenService = require('./tokenService')
const ApiError = require('../error/ApiError')

const User = require('../data/repositories/userRepository')
const Profile = require('../data/repositories/profileRepository')
const profileService = require('./profileService')
const profileRepository = require('../data/repositories/profileRepository')

class UserService {
	async registration(name, email, password) {
		const candidateByName = await User.findOne(name)
		if (candidateByName) {
			throw ApiError.badRequest(`Пользователь с именем ${name} существует`)
		}
		const candidateByEmail = await User.findOneByEmail(email)
		if (candidateByEmail) {
			throw ApiError.badRequest(`Пользователь с email ${email} существует`)
		}
		const hashPassword = await bcrypt.hash(password, 3)
		const user = await User.create(name, email, hashPassword)
		const userId = user.id

		const profile = await profileRepository.create(userId)
		const userDto = new UserDto(user)
		const token = tokenService.generateToken({ ...userDto })

		return {
			token,
			user: userDto,
		}
	}

	async login(name, password) {
		const user = await User.findOne(name)
		if (!user) {
			throw ApiError.badRequest(`Пользователь с именем ${name} не существует`)
		}
		const isPassEquals = await bcrypt.compare(password, user.password)
		if (!isPassEquals) {
			throw ApiError.badRequest('Неверный пароль')
		}
		const userId = user.id
		const avatar = await profileService.getProfileAvatar(userId)
		const userDto = new UserDto(user, avatar)
		const token = tokenService.generateToken({ ...userDto })

		return {
			token,
			user: userDto,
		}
	}

	async check(userData) {
		const userDto = new UserDto(userData, userData.avatar)
		const token = tokenService.generateToken({ ...userDto })
		return {
			token,
			user: userDto,
		}
	}
}

module.exports = new UserService()
