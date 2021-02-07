// The "Cloud Functions for Firebase" SDK to create Cloud Functions and setup triggers:
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database:
const admin = require('firebase-admin');
admin.initializeApp();

// Definition of the Cloud Function reacting to publication on the telemetry topic:
exports.detectTelemetryEvents = functions.pubsub.topic('iot-topic').onPublish(
    (message, context) => {
        // The onPublish() trigger function requires a handler function that receives
        // 2 arguments: one related to the message published and
        // one related to the context of the message.

        // Firebase SDK for Cloud Functions has a 'json' helper property to decode
        // the message.
        const soil_humidity = Math.round(message.json.soil_humidity);
        
        // A Pub/Sub message has an 'attributes' property. This property has itself some properties,
        // one of them being 'deviceId' to know which device published the message:
        const deviceId = message.attributes.deviceId;
        // The date the message was issued lies in the context object not in the message object:
        const timestamp = context.timestamp;

        // create new object for database
        let entry = {
            timestamp: timestamp,
            soil_humidity: soil_humidity
        };

        // add key for temp, if it exists
        if ("temp" in message.json) { 
            entry.temp = Math.round(message.json.temp);
        }
        // add key for humidity, if it exists
        if ("humidity" in message.json) { 
            entry.humidity = Math.round(message.json.humidity);
        }

        // add key for watered_flag, if it exists
        if ("watered_flag" in message.json) { 
            entry.watered_flag = message.json.watered_flag;
        }

        // Log telemetry activity:
        console.log(`Device=${deviceId}, Soil Humidity=${soil_humidity}%, Timestamp=${timestamp}`);
        // Push to Firebase Realtime Database telemetry data sorted by device:
        return admin.database().ref(`devices-sensor-telemetry/${deviceId}`).push(entry);
    });
