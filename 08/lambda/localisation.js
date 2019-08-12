// positive sound for birthday greeting from Alexa Sound Library
// https://developer.amazon.com/docs/custom-skills/ask-soundlibrary.html
const POSITIVE_SOUND = `<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_02'/>`;
// congratulations greeting (speechcon)
// https://developer.amazon.com/docs/custom-skills/speechcon-reference-interjections-spanish.html
const ES = {
    GREETING_SPEECHCON: `<say-as interpret-as="interjection">felicidades</say-as>`,
    DOUBT_SPEECHCON: `<say-as interpret-as="interjection">hmm</say-as>`
}
// https://developer.amazon.com/docs/custom-skills/speechcon-reference-interjections-french.html
// https://developer.amazon.com/docs/custom-skills/speechcon-reference-interjections-french-ca.html
const FR = {
    GREETING_SPEECHCON: `<say-as interpret-as="interjection">Yay</say-as>`,
    DOUBT_SPEECHCON: `<say-as interpret-as="interjection">Hmmm</say-as>`
}

module.exports = {
    es: {
        translation: {
            WELCOME_MSG: 'Te doy la bienvenida {{name}}! ',
            REGISTER_MSG: '{{name}} Tu fecha de cumpleaños es el {{day}} de {{month}} de {{year}}. ',
            DAYS_LEFT_MSG: '{{name}} Falta {{count}} día ',
            DAYS_LEFT_MSG_plural: '{{name}} Faltan {{count}} días ',
            WILL_TURN_MSG: 'para que cumplas {{count}} año. ',
            WILL_TURN_MSG_plural: 'para que cumplas {{count}} años. ',
            GREET_MSG: POSITIVE_SOUND + ES.GREETING_SPEECHCON + '! {{name}} ',
            NOW_TURN_MSG: 'Hoy cumples {{count}} año! ',
            NOW_TURN_MSG_plural: 'Hoy cumples {{count}} años! ',
            MISSING_MSG: ES.DOUBT_SPEECHCON + '!. Parece que aun no me has dicho tu fecha de cumpleaños. ',
            HELP_MSG: 'Puedo recordar tu cumpleaños si me dices una fecha. Y decirte cuanto falta para que cumplas. También puedo crear un recordatorio para cuando cumplas o decirte quién cumple años hoy. ',
            SHORT_HELP_MSG: 'Dime que otra cosa quieres hacer o solo dí, ayuda, si no estas seguro, o, para, si quieres salir. ',
            GOODBYE_MSG: ['Hasta luego {{name}}! ', 'Adios {{name}}! ', 'Hasta pronto {{name}}! ', 'Nos vemos {{name}}! '],
            REFLECTOR_MSG: 'Acabas de activar {{intent}}',
            FALLBACK_MSG: 'Lo siento, no se nada sobre eso. Por favor inténtalo otra vez. ',
            ERROR_MSG: 'Lo siento, ha habido un problema. Por favor inténtalo otra vez. ',
            NO_TIMEZONE_MSG: 'No he podido determinar tu zona horaria. Verifica la configuración de tu dispositivo e inténtalo otra vez.',
            REMINDER_CREATED_MSG: 'El recordatorio se ha creado con éxito. ',
            REMINDER_ERROR_MSG: 'Ha habido un error al crear el recordatorio. ',
            UNSUPPORTED_DEVICE_MSG: 'Este dispositivo no soporta la operación que estás intentando realizar. ',
            CANCEL_MSG: 'Vale. Lo cancelamos. ',
            MISSING_PERMISSION_MSG: 'Parece que no has autorizado el envío de recordatorios. Te he enviado una tarjeta a la app Alexa para que lo habilites. ',
            API_ERROR_MSG: 'Lo siento, ha habido un problema de acceso a la API externa. Por favor inténtalo otra vez. ',
            PROGRESSIVE_MSG: 'Déjame ver quién cumple hoy. ',
            CONJUNCTION_MSG: ' y ',
            CELEBRITY_BIRTHDAYS_MSG: 'En esta fecha cumplen años: ',
            ALSO_TODAY_MSG: 'También hoy cumplen: ',
            LAUNCH_HEADER_MSG: 'Feliz Cumpleaños',
            LAUNCH_TEXT_FILLED_MSG: '{{day}}/{{month}}/{{year}}',
            LAUNCH_TEXT_EMPTY_MSG: '¿Cuándo cumples?',
            LAUNCH_HINT_MSG: ['cuanto falta para mi cumpleaños?', 'quién cumple años hoy?', 'crea un recordatorio para mi cumpleaños', 'registra mi fecha de cumpleaños']
        }
    },
    fr: {
        translation: {
            WELCOME_MSG: 'Je vous souhaite la bienvenue {{name}}! ',
            REGISTER_MSG: '{{name}} Votre date de naissance est le {{day}} {{month}} {{year}}. ',
            DAYS_LEFT_MSG: '{{name}} Il reste vous {{count}} jour ',
            DAYS_LEFT_MSG_plural: '{{name}} Il reste vous {{count}} jours ',
            WILL_TURN_MSG: 'avant d\'avoir {{count}} an. ',
            WILL_TURN_MSG_plural: 'avant d\'avoir {{count}} ans. ',
            GREET_MSG: POSITIVE_SOUND + FR.GREETING_SPEECHCON + '! {{name}} ',
            NOW_TURN_MSG: 'Aujourd\'hui, vous avez {{count}} an! ',
            NOW_TURN_MSG_plural: 'Aujourd\'hui, vous avez {{count}} ans! ',
            MISSING_MSG: FR.DOUBT_SPEECHCON + '. Il me semble que vous ne m\'avez pas encore dit votre date de naissance. ',
            HELP_MSG: 'Je peux me souvenir de votre anniversaire et vous dire le nombre de jours restant avant de le fêter. $t(SHORT_HELP_MSG) ',
            SHORT_HELP_MSG: 'Dites-moi \'enregistre ma date de naissance\' pour que je m\'en rappelle ou \'combien de jours reste-t-il avant mon anniversaire\' pour savoir le temps restant avant de l\'arroser! ',
            GOODBYE_MSG: ['Au revoir {{name}}! ', 'A bientôt {{name}}! ', 'A la prochaine fois {{name}}! '],
            REFLECTOR_MSG: 'Vous avez invoqué l\'intention {{intent}}',
            FALLBACK_MSG: 'Désolé, je ne sais pas répondre à votre demande. Pouvez-vous reformuler?. ',
            ERROR_MSG: 'Désolé, je n\'ai pas compris. Pouvez-vous reformuler? ',
            NO_TIMEZONE_MSG: 'Je n\'ai pas réussi à déterminer votre fuseau horaire. Veuillez vérifier les paramètres de votre appareil et réessayez.',
            REMINDER_CREATED_MSG: 'Le rappel vient d\'être créé avec succès. ',
            REMINDER_ERROR_MSG: 'Il y a eu un problème pendant la création du rappel. ',
            UNSUPPORTED_DEVICE_MSG: 'Votre appareil ne supporte pas la création de rappels. ',
            CANCEL_MSG: 'Ok, J\'ai annulé la demande de rappel. ',
            MISSING_PERMISSION_MSG: 'Je n\'ai pas accès à la création de rappels. Veuillez accéder à votre application Alexa et suivez les instructions depuis la card que je vous ai envoyé. ',
            API_ERROR_MSG: 'Désolé, je n\'ai trouvé personne pour cette date. Veuillez réessayer. ',
            PROGRESSIVE_MSG: 'Je recherche des célébrités nées aujourd\'hui... ',
            CONJUNCTION_MSG: ' et ',
            CELEBRITY_BIRTHDAYS_MSG: 'En ce jour, les célébrités suivantes fêtent leur anniversaire: ',
            ALSO_TODAY_MSG: 'C\'est aussi l\'anniversaire de : ',
            LAUNCH_HEADER_MSG: 'Joyeux Anniversaire',
            LAUNCH_TEXT_FILLED_MSG: '{{day}}/{{month}}/{{year}}',
            LAUNCH_TEXT_EMPTY_MSG: 'Quand est mon anniversaire ?',
            LAUNCH_HINT_MSG: ['combien de temps reste-t-il avant mon anniversaire ?', 'qui est né aujourd\'hui?', 'rappelle-moi mon anniversaire', 'enregistre ma date de naissance']
        }
    },
    "fr-CA" : {
        translation: {
            GREET_MSG: 'Bonne fête! Aujourd\'hui, vous avez {{count}} an!',
            GREET_MSG_plural: 'Bonne fête! Aujourd\'hui, vous avez {{count}} ans! ',
            HELP_MSG: 'Je peux me souvenir de votre fête et vous dire le nombre de jours restant avant de le célébrer. $t(SHORT_HELP_MSG)',
            SHORT_HELP_MSG: 'Dites-moi \'sauve ma date de naissance\' pour que je m\'en rappelle ou \'combien de jours reste-t-il avant ma fête\' pour savoir le temps restant avant de l\'arroser! ',
            CELEBRITY_BIRTHDAYS_MSG: 'En ce jour, les vedettes suivantes célèbrent leur fête: ',
            ALSO_TODAY_MSG: 'C\'est aussi la fête de : ',
            LAUNCH_HEADER_MSG: 'Bonne Fête',
            LAUNCH_TEXT_EMPTY_MSG: 'Quand est ma fête ?',
            LAUNCH_HINT_MSG: ['combien de temps reste-t-il avant ma fête ?', 'qui est né aujourd\'hui?', 'rappelle-moi ma fête', 'sauve ma date de naissance']
        }
    }
}