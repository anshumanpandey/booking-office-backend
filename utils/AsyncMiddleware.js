const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch((err) => {
      console.log(err)
      if (err.name === 'SequelizeUniqueConstraintError') {
        res.status(400).send({ error: err.errors.map(e => e.message).join(',') })
        return;
      }
      res.status(400).send({ error: err.message })
    })

module.exports = asyncHandler