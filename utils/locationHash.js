module.exports = function locationHash(location) {
  return `${location.country_code}-${location.state}-${location.city}`
}
