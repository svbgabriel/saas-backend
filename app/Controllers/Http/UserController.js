'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/auth/src/Schemes/Session')} AuthSession */

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use('App/Models/User')
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Invite = use('App/Models/Invite')

class UserController {
  /**
   * Create/save a new project.
   * POST projects
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {AuthSession} ctx.auth
   */
  async store ({ request, response, auth }) {
    const data = request.only(['name', 'email', 'password'])

    const teamsQuery = Invite.query().where('email', data.email)
    const teams = await teamsQuery.pluck('team_id')

    if (teams.length === 0) {
      return response.status(401).send({ message: "You're not invited to any team." })
    }

    const user = await User.create(data)

    await user.teams().attach(teams)

    await teamsQuery.delete()

    const token = await auth.attempt(data.email, data.password)

    return token
  }
}

module.exports = UserController
