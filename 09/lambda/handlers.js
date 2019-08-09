const logic = require('./logic');
const constants = require('./constants');
const util = require('./util');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();

        const day = sessionAttributes['day'];
        const monthName = sessionAttributes['monthName'];
        const year = sessionAttributes['year'];
        const name = sessionAttributes['name'] ? sessionAttributes['name'] + '.' : '';

        const dateAvailable = day && monthName && year;
        if(dateAvailable) {
            // we can't use intent chaining because the intent is not dialog based
            return SayBirthdayIntentHandler.handle(handlerInput);
        }
        const speechText = handlerInput.t('WELCOME_MSG', {name: name+'.'}) + handlerInput.t('MISSING_MSG');
        // we use intent chaining to trigger the birthday registration multi-turn
        return handlerInput.responseBuilder
            .speak(speechText)
            .addDelegateDirective({
                name: 'RegisterBirthdayIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const RegisterBirthdayIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RegisterBirthdayIntent';
    },
    handle(handlerInput) {
        const {attributesManager, requestEnvelope, responseBuilder} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = requestEnvelope.request;

        const day = intent.slots.day.value;
        const month = intent.slots.month.resolutions.resolutionsPerAuthority[0].values[0].value.id; //MM
        const monthName = intent.slots.month.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        const year = intent.slots.year.value;

        sessionAttributes['day'] = day;
        sessionAttributes['month'] = month; //MM
        sessionAttributes['monthName'] = monthName;
        sessionAttributes['year'] = year;
        const name = sessionAttributes['name'] ? sessionAttributes['name'] + '. ' : '';

        const speechText = handlerInput.t('REGISTER_MSG', {name: name, day: day, month: monthName, year: year}) + handlerInput.t('SHORT_HELP_MSG');

        // Add APL directive to response
        if (util.supportsAPL(handlerInput)) {
            const {Viewport} = requestEnvelope.context;
            const resolution = Viewport.pixelWidth + 'x' + Viewport.pixelHeight;
            responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: constants.APL.launchDoc,
                datasources: {
                    launchData: {
                        type: 'object',
                        properties: {
                            headerTitle: handlerInput.t('LAUNCH_HEADER_MSG'),
                            mainText: handlerInput.t('LAUNCH_TEXT_FILLED_MSG', {day: day, month: parseInt(month, 10), year: year}),
                            hintString: handlerInput.t('LAUNCH_HINT_MSG'),
                            logoImage: Viewport.pixelWidth > 960 ? util.getS3PreSignedUrl('Media/full_icon_512.png') : util.getS3PreSignedUrl('Media/full_icon_108.png'),
                            backgroundImage: util.getS3PreSignedUrl('Media/garlands_'+resolution+'.png'),
                            backgroundOpacity: "0.5"
                        },
                        transformers: [{
                            inputPath: 'hintString',
                            transformer: 'textToHint',
                        }]
                    }
                }
            });
        }

        // Add card to response
        responseBuilder.withStandardCard(
                handlerInput.t('LAUNCH_HEADER_MSG'),
                handlerInput.t('LAUNCH_TEXT_FILLED_MSG', {day: day, month: parseInt(month, 10), year: year}),
                util.getS3PreSignedUrl('Media/garlands_480x480.png'));

        return responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('HELP_MSG'))
            .getResponse();
    }
};

const SayBirthdayIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SayBirthdayIntent';
    },
    async handle(handlerInput) {
        const {attributesManager, responseBuilder} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();

        const day = sessionAttributes['day'];
        const month = sessionAttributes['month']; //MM
        const year = sessionAttributes['year'];
        const name = sessionAttributes['name'] ? sessionAttributes['name'] + '. ' : '';
        let timezone = requestAttributes['timezone'];

        const dateAvailable = day && month && year;
        if(dateAvailable){
            if(!timezone){
                //timezone = 'Europe/Madrid';  // so it works on the simulator, you should uncomment this line, replace with your time zone and comment sentence below
                return responseBuilder
                    .speak(handlerInput.t('NO_TIMEZONE_MSG'))
                    .getResponse();
            }

            const birthdayData = logic.getBirthdayData(day, month, year, timezone);
            sessionAttributes['age'] = birthdayData.age;
            sessionAttributes['daysLeft'] = birthdayData.daysUntilBirthday;
            speechText = handlerInput.t('DAYS_LEFT_MSG', {name: name, count: birthdayData.daysUntilBirthday});
            speechText += handlerInput.t('WILL_TURN_MSG', {count: birthdayData.age + 1});
            let speechText;
            const isBirthday = birthdayData.daysUntilBirthday === 0;
            if(isBirthday) { // it's the user's birthday!
                speechText = handlerInput.t('GREET_MSG', {name: name});
                speechText += handlerInput.t('NOW_TURN_MSG', {count: birthdayData.age});

                const dateData = logic.getAdjustedDateData(timezone);
                const response = await logic.fetchBirthdaysData(dateData.day, dateData.month, constants.MAX_BIRTHDAYS);

                if(response) { // if the API call fails we just don't append today's birthdays
                    console.log(JSON.stringify(response));
                    const results = response.results.bindings;
                    speechText += handlerInput.t('ALSO_TODAY_MSG');
                    results.forEach((person, index) => {
                        console.log(person);
                        if(index === Object.keys(results).length - 2)
                            speechText += person.humanLabel.value + handlerInput.t('CONJUNCTION_MSG');
                        else
                            speechText += person.humanLabel.value + '. '
                    });
                }
            } else {
                speechText = handlerInput.t('DAYS_LEFT_MSG', {name: name, count: birthdayData.daysUntilBirthday});
                speechText += handlerInput.t('WILL_TURN_MSG', {count: birthdayData.age + 1});
            }
            // Add card to response
            responseBuilder.withStandardCard(
                handlerInput.t('LAUNCH_HEADER_MSG'),
                isBirthday ? sessionAttributes['age'] : handlerInput.t('DAYS_LEFT_MSG', {name: '', count: sessionAttributes['daysLeft']}),
                isBirthday ? util.getS3PreSignedUrl('Media/cake_480x480.png') : util.getS3PreSignedUrl('Media/papers_480x480.png'));
            // Add APL directive to response
            if (util.supportsAPL(handlerInput)) {
                const {Viewport} = handlerInput.requestEnvelope.context;
                const resolution = Viewport.pixelWidth + 'x' + Viewport.pixelHeight;
                responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    version: '1.0',
                    document: constants.APL.launchDoc,
                    datasources: {
                        launchData: {
                            type: 'object',
                            properties: {
                                headerTitle: handlerInput.t('LAUNCH_HEADER_MSG'),
                                mainText: isBirthday ? sessionAttributes['age'] : handlerInput.t('DAYS_LEFT_MSG', {name: '', count: sessionAttributes['daysLeft']}),
                                hintString: handlerInput.t('LAUNCH_HINT_MSG'),
                                logoImage: isBirthday ? null : Viewport.pixelWidth > 960 ? util.getS3PreSignedUrl('Media/full_icon_512.png') : util.getS3PreSignedUrl('Media/full_icon_108.png'),
                                backgroundImage: isBirthday ? util.getS3PreSignedUrl('Media/cake_'+resolution+'.png') : util.getS3PreSignedUrl('Media/papers_'+resolution+'.png'),
                                backgroundOpacity: isBirthday ? "1" : "0.5"
                            },
                            transformers: [{
                                inputPath: 'hintString',
                                transformer: 'textToHint',
                            }]
                        }
                    }
                });
            }
            speechText += handlerInput.t('SHORT_HELP_MSG');
            return responseBuilder
                .speak(speechText)
                .reprompt(handlerInput.t('HELP_MSG'))
                .getResponse();
        }
        // birthday is not yet available, use Intent Chaining to tell Alexa to handle Dialog Management for Intent 'RegisterBirthdayIntent'
        return responseBuilder
            .speak(handlerInput.t('MISSING_MSG'))
            .addDelegateDirective({
                name: 'RegisterBirthdayIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const RemindBirthdayIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RemindBirthdayIntent';
    },
    async handle(handlerInput) {
        const {intent} = handlerInput.requestEnvelope.request;
        if(intent.confirmationStatus !== 'CONFIRMED') {
            return handlerInput.responseBuilder
                .speak(handlerInput.t('CANCEL_MSG') + handlerInput.t('SHORT_HELP_MSG'))
                .reprompt(handlerInput.t('HELP_MSG'))
                .getResponse();
        }

        const {attributesManager, responseBuilder, serviceClientFactory, requestEnvelope} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();

        const day = sessionAttributes['day'];
        const month = sessionAttributes['month'];
        const year = sessionAttributes['year'];
        let timezone = requestAttributes['timezone'];
        const message = intent.slots.message.value;

        if(day && month && year){
            if(!timezone){
                //timezone = 'Europe/Madrid';  // so it works on the simulator, you should uncomment this line, replace with your time zone and comment sentence below
                return responseBuilder
                    .speak(handlerInput.t('NO_TIMEZONE_MSG'))
                    .getResponse();
            }

            const birthdayData = logic.getBirthdayData(day, month, year, timezone);
            let speechText;
            // let's try to create a reminder via the Reminders API
            // don't forget to enable this permission in your skill configuratiuon (Build tab -> Permissions)
            // or you'll get a SessionEnndedRequest with an ERROR of type INVALID_RESPONSE
            try {
                const {permissions} = requestEnvelope.context.System.user;
                if(!(permissions && permissions.consentToken))
                    throw { statusCode: 401, message: 'No permissions available' }; // there are zero permissions, no point in intializing the API
                const reminderServiceClient = serviceClientFactory.getReminderManagementServiceClient();
                // reminders are retained for 3 days after they 'remind' the customer before being deleted
                const remindersList = await reminderServiceClient.getReminders();
                console.log('Current reminders: ' + JSON.stringify(remindersList));
                // delete previous reminder if present
                const previousReminder = sessionAttributes['reminderId'];
                if(previousReminder){
                    try {
                        if(remindersList.totalCount !== "0")
                            await reminderServiceClient.deleteReminder(previousReminder);
                    } catch (error) {
                        // fail silently as this means the reminder does not exist or there was a problem with deletion
                        // either way, we can move on and create the new reminder
                        console.log('Failed to delete reminder: ' + previousReminder + ' via ' + JSON.stringify(error));
                    }
                    delete sessionAttributes['reminderId'];
                    console.log('Deleted previous reminder token: ' + previousReminder);
                }
                // create reminder structure
                const reminder = logic.createReminderData(
                    birthdayData.daysUntilBirthday,
                    timezone,
                    requestEnvelope.request.locale,
                    message);
                const reminderResponse = await reminderServiceClient.createReminder(reminder); // the response will include an "alertToken" which you can use to refer to this reminder
                // save reminder id in session attributes
                sessionAttributes['reminderId'] = reminderResponse.alertToken;
                console.log('Reminder created with token: ' + reminderResponse.alertToken);
                speechText = handlerInput.t('REMINDER_CREATED_MSG');
            } catch (error) {
                console.log(JSON.stringify(error));
                switch (error.statusCode) {
                    case 401: // the user has to enable the permissions for reminders, let's attach a permissions card to the response
                        responseBuilder.withAskForPermissionsConsentCard(constants.REMINDERS_PERMISSION);
                        speechText = handlerInput.t('MISSING_PERMISSION_MSG');
                        break;
                    case 403: // devices such as the simulator do not support reminder management
                        speechText = handlerInput.t('UNSUPPORTED_DEVICE_MSG');
                        break;
                    //case 405: METHOD_NOT_ALLOWED, please contact the Alexa team
                    default:
                        speechText = handlerInput.t('REMINDER_ERROR_MSG');
                }
            }
            // Add card to response
            responseBuilder.withStandardCard(
                handlerInput.t('LAUNCH_HEADER_MSG'),
                speechText,
                util.getS3PreSignedUrl('Media/straws_480x480.png'));
            // Add APL directive to response
            if (util.supportsAPL(handlerInput)) {
                const {Viewport} = requestEnvelope.context;
                const resolution = Viewport.pixelWidth + 'x' + Viewport.pixelHeight;
                responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    version: '1.0',
                    document: constants.APL.launchDoc,
                    datasources: {
                        launchData: {
                            type: 'object',
                            properties: {
                                headerTitle: handlerInput.t('LAUNCH_HEADER_MSG'),
                                mainText: speechText,
                                hintString: handlerInput.t('LAUNCH_HINT_MSG'),
                                logoImage: Viewport.pixelWidth > 960 ? util.getS3PreSignedUrl('Media/full_icon_512.png') : util.getS3PreSignedUrl('Media/full_icon_108.png'),
                                backgroundImage: util.getS3PreSignedUrl('Media/straws_'+resolution+'.png'),
                                backgroundOpacity: "0.5"
                            },
                            transformers: [{
                                inputPath: 'hintString',
                                transformer: 'textToHint',
                            }]
                        }
                    }
                });
            }
            speechText += handlerInput.t('SHORT_HELP_MSG');
            return responseBuilder
                .speak(speechText)
                .reprompt(handlerInput.t('HELP_MSG'))
                .getResponse();
        }
        // birthday is not yet available, use Intent Chaining to tell Alexa to handle Dialog Management for Intent 'RegisterBirthdayIntent'
        return responseBuilder
            .speak(handlerInput.t('MISSING_MSG'))
            .addDelegateDirective({
                name: 'RegisterBirthdayIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .getResponse();
    }
};

const CelebrityBirthdaysIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CelebrityBirthdaysIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        let timezone = requestAttributes['timezone'];

        if(!timezone){
           //timezone = 'Europe/Madrid';  // so it works on the simulator, you should uncomment this line, replace with your time zone and comment sentence below
           return handlerInput.responseBuilder
             .speak(handlerInput.t('NO_TIMEZONE_MSG'))
             .getResponse();
        }

        try {
            // call the progressive response service
            await logic.callDirectiveService(handlerInput, handlerInput.t('PROGRESSIVE_MSG'));
          } catch (error) {
            // if it fails we can continue, but the user will wait without progressive response
            console.log("Progressive directive error : " + error);
        }

        const dateData = logic.getAdjustedDateData(timezone);
        const response = await logic.fetchBirthdaysData(dateData.day, dateData.month, constants.MAX_BIRTHDAYS);

        let speechText = handlerInput.t('API_ERROR_MSG');

        let results;
        if(response) {
            console.log(JSON.stringify(response));
            results = response.results.bindings;
            speechText = handlerInput.t('CELEBRITY_BIRTHDAYS_MSG');
            results.forEach((person, index) => {
                console.log(person);
                const age = logic.convertBirthdateToYearsOld(person, timezone);
                person.date_of_birth.value = handlerInput.t('LIST_YO_ABBREV_MSG', {count: age});
                if(index === Object.keys(results).length - 2)
                    speechText += person.humanLabel.value + handlerInput.t('CONJUNCTION_MSG');
                else
                    speechText += person.humanLabel.value + '. '
            });
        }

        // Add APL directive to response
        if (util.supportsAPL(handlerInput) && results) {
            const {Viewport} = handlerInput.requestEnvelope.context;
            const resolution = Viewport.pixelWidth + 'x' + Viewport.pixelHeight;
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: constants.APL.listDoc,
                datasources: {
                    listData: {
                        type: 'object',
                        properties: {
                            config: {
                                backgroundImage: util.getS3PreSignedUrl('Media/lights_'+resolution+'.png'),
                                title: handlerInput.t('LIST_HEADER_MSG'),
                                skillIcon: util.getS3PreSignedUrl('Media/full_icon_108.png'),
                                hintText: handlerInput.t('LIST_HINT_MSG')
                            },
                            list: {
                                listItems: results
                            }
                        },
                        transformers: [{
                            inputPath: 'config.hintText',
                            transformer: 'textToHint'
                        }]
                    }
                }
            });
        }

        // Add card to response
        handlerInput.responseBuilder.withStandardCard(
                handlerInput.t('LIST_HEADER_MSG'),
                speechText,
                util.getS3PreSignedUrl('Media/lights_480x480.png'));

        speechText += handlerInput.t('SHORT_HELP_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('HELP_MSG'))
            .getResponse();
    }
};

const TouchIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent';
    },
    handle(handlerInput) {
        console.log('Touch event arguments: ' + JSON.stringify(handlerInput.requestEnvelope.request.arguments[0]));
        let person = JSON.parse(handlerInput.requestEnvelope.request.arguments[0]);
        let speechText = handlerInput.t('LIST_PERSON_DETAIL_MSG', {person: person});

        speechText += handlerInput.t('SHORT_HELP_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('HELP_MSG'))
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = handlerInput.t('HELP_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const name = sessionAttributes['name'] ? sessionAttributes['name'] : '';

        const speechText = handlerInput.t('GOODBYE_MSG', {name: name});

        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speechText = handlerInput.t('FALLBACK_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('HELP_MSG'))
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = handlerInput.t('REFLECTOR_MSG', {intent: intentName});

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speechText = handlerInput.t('ERROR_MSG');

        console.log(`~~~~ Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(handlerInput.t('HELP_MSG'))
            .getResponse();
    }
};

module.exports = {
    LaunchRequestHandler,
    RegisterBirthdayIntentHandler,
    SayBirthdayIntentHandler,
    RemindBirthdayIntentHandler,
    CelebrityBirthdaysIntentHandler,
    TouchIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler,
    ErrorHandler
}
