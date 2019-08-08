// positive sound for birthday greeting from Alexa Sound Library
// https://developer.amazon.com/docs/custom-skills/ask-soundlibrary.html
const POSITIVE_SOUND = `<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_02'/>`;
// congratulations greeting (speechcon)
// https://developer.amazon.com/docs/custom-skills/speechcon-reference-interjections-spanish.html
const GREETING_SPEECHCON = `<say-as interpret-as="interjection">felicidades</say-as>`;
const DOUBT_SPEECHCON = `<say-as interpret-as="interjection">hmm</say-as>`;

module.exports = {
    es: {
        translation: {
            WELCOME_MSG: 'Te doy la bienvenida {{name}}! ',
            REGISTER_MSG: '{{name}} Tu fecha de cumpleaños es el {{day}} de {{month}} de {{year}}. ',
            DAYS_LEFT_MSG: '{{name}} Queda {{count}} día ',
            DAYS_LEFT_MSG_plural: '{{name}} Quedan {{count}} días ',
            WILL_TURN_MSG: 'para que cumplas {{count}} año. ',
            WILL_TURN_MSG_plural: 'para que cumplas {{count}} años. ',
            GREET_MSG: POSITIVE_SOUND + GREETING_SPEECHCON + ' {{name}} ',
            NOW_TURN_MSG: 'Hoy cumples {{count}} año! ',
            NOW_TURN_MSG_plural: 'Hoy cumples {{count}} años! ',
            MISSING_MSG: DOUBT_SPEECHCON + '. Parece que aun no me has dicho tu fecha de cumpleaños. ',
            HELP_MSG: 'Puedo recordar tu cumpleaños si me dices una fecha. O decirte cuanto falta para que cumplas. ',
            SHORT_HELP_MSG: 'Dime que otra cosa quieres hacer o solo dí, ayuda, si no estas seguro, o, para, si quieres salir. ',
            GOODBYE_MSG: ['Hasta luego {{name}}! ', 'Adios {{name}}! ', 'Hasta pronto {{name}}! ', 'Nos vemos {{name}}! '],
            REFLECTOR_MSG: 'Acabas de activar {{intent}}',
            FALLBACK_MSG: 'Lo siento, no se nada sobre eso. Por favor inténtalo otra vez. ',
            ERROR_MSG: 'Lo siento, ha habido un problema. Por favor inténtalo otra vez. ',
            NO_TIMEZONE_MSG: 'No he podido determinar tu zona horaria. Verifica la configuración de tu dispositivo e inténtalo otra vez.'
        }
    },
    fr: {
        translation: {
            WELCOME_MSG: 'Je vous souhaite la bienvenue {{name}}! ',
            REGISTER_MSG: '{{name}} Votre date de naissance est le {{day}} {{month}} {{year}}. ',
            DAYS_LEFT_MSG: '{{name}} Il vous reste {{count}} jour ',
            DAYS_LEFT_MSG_plural: '{{name}} Il vous reste {{count}} jours ',
            WILL_TURN_MSG: 'avant d\'avoir {{count}} an. ',
            WILL_TURN_MSG_plural: 'avant d\'avoir {{count}} ans. ',
            GREET_MSG: POSITIVE_SOUND + GREETING_SPEECHCON + ' {{name}} ',
            NOW_TURN_MSG: 'Aujourd\'hui, vous avez {{count}} an! ',
            NOW_TURN_MSG_plural: 'Aujourd\'hui, vous avez {{count}} ans! ',
            MISSING_MSG: DOUBT_SPEECHCON + '. Il me semble que vous ne m\'avez pas encore dit votre date de naissance. ',
            HELP_MSG: 'Je peux me souvenir de votre anniversaire et vous dire le nombre de jours restant avant de le fêter. $t(SHORT_HELP_MSG) ',
            SHORT_HELP_MSG: 'Dites-moi \'enregistre ma date de naissance\' pour que je m\'en rappelle ou \'combien de jours reste-t-il avant mon anniversaire\' pour savoir le temps restant avant de l\'arroser! ',
            GOODBYE_MSG: ['Au revoir {{name}}! ', 'A bientôt {{name}}! ', 'A la prochaine fois {{name}}! '],
            REFLECTOR_MSG: 'Vous avez invoqué l\'intention {{intent}}',
            FALLBACK_MSG: 'Désolé, je ne sais pas répondre à votre demande. Pouvez-vous reformuler?. ',
            ERROR_MSG: 'Désolé, je n\'ai pas compris. Pouvez-vous reformuler? ',
            NO_TIMEZONE_MSG: 'Je n\'ai pas réussi à déterminer votre fuseau horaire. Veuillez vérifier les paramètres de votre appareil et réessayez.'
        }
    },
    "fr-CA" : {
        translation: {
            GREET_MSG: 'Bonne fête! Aujourd\'hui, vous avez {{count}} an!',
            GREET_MSG_plural: 'Bonne fête! Aujourd\'hui, vous avez {{count}} ans! ',
            HELP_MSG: 'Je peux me souvenir de votre fête et vous dire le nombre de jours restant avant de le célébrer. $t(SHORT_HELP_MSG)',
            SHORT_HELP_MSG: 'Dites-moi \'sauve ma date de naissance\' pour que je m\'en rappelle ou \'combien de jours reste-t-il avant ma fête\' pour savoir le temps restant avant de l\'arroser! ',
        }
    }
}
