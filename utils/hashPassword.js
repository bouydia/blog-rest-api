const bcrypt=require('bcryptjs')

module.exports.hashPassword = async password => {
  const salt = await bcrypt.genSalt(10)
    const newPass = await bcrypt.hash(password, salt)
    return newPass
}
