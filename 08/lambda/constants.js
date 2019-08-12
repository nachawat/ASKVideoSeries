module.exports = {
    // Permission needed to access Customer Given Name from Customer Profile API (read-only)
    GIVEN_NAME_PERMISSION: ['alexa::profile:given_name:read'],
    // Permission needed to create and fetch Reminders from Reminders API
    REMINDERS_PERMISSION: ['alexa::alerts:reminders:skill:readwrite'],
    // Max number of entries to fetch from the external API
    MAX_BIRTHDAYS: 5,
    // APL documents
    APL: {
        launchDoc: require('./documents/launchScreen.json')
    }
}