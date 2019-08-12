const Alexa = require('ask-sdk-core');
const util = require('./util');

const moment = require('moment-timezone'); // will help us do all the birthday math

// i18n dependency
const i18n = require('i18next');

// We import a language strings object containing all of our strings.
// The keys for each string will then be referenced in our code
// e.g. handlerInput.t('WELCOME_MSG')
const languageStrings = require('./localisation');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const { attributesManager, responseBuilder } = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();

        const day = sessionAttributes['day'];
        const monthName = sessionAttributes['monthName'];
        const year = sessionAttributes['year'];

        const dateAvailable = day && monthName && year;
        if(dateAvailable){
            const speechText = handlerInput.t('REGISTER_MSG', {day: day, month: monthName, year: year}) 
                                + handlerInput.t('SHORT_HELP_MSG');
            return responseBuilder
                .speak(speechText)
                .reprompt(handlerInput.t('HELP_MSG'))
                .getResponse();
        }
        // birthday is not yet available, use Intent Chaining to tell Alexa to handle Dialog Management for Intent 'RegisterBirthdayIntent'
        return responseBuilder
            .speak(handlerInput.t('WELCOME_MSG'))
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
        const {attributesManager, requestEnvelope} = handlerInput;
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

        const speechText = handlerInput.t('REGISTER_MSG', {day: day, month: monthName, year: year}) + handlerInput.t('SHORT_HELP_MSG');

        return handlerInput.responseBuilder
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
        const sessionAttributes = attributesManager.getSessionAttributes();

        const day = sessionAttributes['day'];
        const month = sessionAttributes['month']; //MM
        const year = sessionAttributes['year'];

        const dateAvailable = day && month && year;
        if(dateAvailable){
            const timezone = 'Europe/Madrid'; // provide yours here. we'll change this later to retrieve the timezone from the device
            const today = moment().tz(timezone).startOf('day');
            const wasBorn = moment(`${month}/${day}/${year}`, "MM/DD/YYYY").tz(timezone).startOf('day');
            const nextBirthday = moment(`${month}/${day}/${today.year()}`, "MM/DD/YYYY").tz(timezone).startOf('day');
            if(today.isAfter(nextBirthday)){
                nextBirthday.add('years', 1);
            }
            const age = today.diff(wasBorn, 'years');
            const daysUntilBirthday = nextBirthday.startOf('day').diff(today, 'days'); // same days returns 0
            let speechText;
            if(daysUntilBirthday === 0) { // it's the user's birthday!
                speechText = handlerInput.t('GREET_MSG', {count: age});
            } else {
                speechText = handlerInput.t('DAYS_LEFT_MSG', {count: daysUntilBirthday});
                speechText += handlerInput.t('WILL_TURN_MSG', {count: age + 1});
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
        const speechText = handlerInput.t('GOODBYE_MSG');

        return handlerInput.responseBuilder
            .speak(speechText)
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

// This request interceptor will log all incoming requests to this lambda
const LoggingRequestInterceptor = {
    process(handlerInput) {
        console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    }
};

// This response interceptor will log all outgoing responses of this lambda
const LoggingResponseInterceptor = {
    process(handlerInput, response) {
        console.log(`Outgoing response: ${JSON.stringify(response)}`);
    }
};

// This request interceptor will bind a translation function 't' to the handlerInput.
const LocalisationRequestInterceptor = {
    process(handlerInput) {
        i18n.init({
            lng: handlerInput.requestEnvelope.request.locale,
            resources: languageStrings
        }).then((t) => {
            handlerInput.t = (...args) => t(...args);
        });
    }
};

const LoadAttributesRequestInterceptor = {
    async process(handlerInput) {
        const {attributesManager, requestEnvelope} = handlerInput;
        if(requestEnvelope.session['new']){ //is this a new session? this check is not enough if using auto-delegate
            const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
            //copy persistent attribute to session attributes
            attributesManager.setSessionAttributes(persistentAttributes);
        }
    }
};

const SaveAttributesResponseInterceptor = {
    async process(handlerInput, response) {
        if(!response) return; // avoid intercepting calls that have no outgoing response due to errors
        const {attributesManager, requestEnvelope} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const shouldEndSession = (typeof response.shouldEndSession === "undefined" ? true : response.shouldEndSession); //is this a session end?
        if(shouldEndSession || requestEnvelope.request.type === 'SessionEndedRequest') { // skill was stopped or timed out
            attributesManager.setPersistentAttributes(sessionAttributes);
            await attributesManager.savePersistentAttributes();
        }
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        RegisterBirthdayIntentHandler,
        SayBirthdayIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(
        LocalisationRequestInterceptor,
        LoggingRequestInterceptor,
        LoadAttributesRequestInterceptor)
    .addResponseInterceptors(
        LoggingResponseInterceptor,
        SaveAttributesResponseInterceptor)
    .withPersistenceAdapter(util.getPersistenceAdapter())
    .lambda();
