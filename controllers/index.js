const cors = require("cors")({ origin: true });
///--------------PREPARE THE FIREBASE FUNCTIONS-----------///
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const { OAuth2Client } = require('google-auth-library');


var serviceAccount = require('../arshades-7e18a-firebase-adminsdk-k4imz-c413c26805.json');
const SSK = "k4imz-c413c26805";
const FROM = "daraxdray86@gmail.com";
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://arshades-7e18a.firebaseio.com"
    // credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://arshadesstaging-default-rtdb.europe-west1.firebasedatabase.app"
});

// Create a function that sends emails
const mailTransport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: "daraxdray86@gmail.com",
        pass: "gsvtcjjggzyupori"
    }
});


///--------------END OF FIREBASE PREPARATION---------------///

/* GET home page. */
exports.index = (req, res) => {
    res.render('index', { title: 'Express' });
}

exports.fbFunction = async (req, res) => {

    try {
        // Query Firestore for unread notifications

        const notificationsSnapshot = await admin
            .firestore()
            .collection('Lista_Notification')
            .where('status', '==', 'unread')
            .get();

        //       // Iterate through notifications and send emails
        //       // Group notifications by account
        const grouped = await notificationsSnapshot.docs.reduce(async (acc, doc) => {

            const accountRef = doc.data().accRef.id; ///get account reference from prop

            const notifRef = doc.data().notificheRef; ///get the notification prop
            let subject = "";
            //create an array if account has not been added to new array
            if (!acc[accountRef]) {
                acc[accountRef] = [];
            }

            ///get the notifcation propert to send as subject to user
            const notify = await admin.firestore().collection('Dashboard_Notification').doc(notifRef).get()
            subject = notify.data().subject;

            acc[accountRef].push({ ...doc.data(), subject });

            return acc;
        }, {});

        var count = 0;
        //     //   // Send summary email to each account
        const promises = Object.keys(grouped).map(accRef => {
            count++;
            if (count > 2) return
            return sendSummaryEmail(accRef, grouped[accRef]);

        });

        return res.status(200).json(Promise.all(promises));
    } catch (error) {
        console.error('Error sending emails:', error);
        return res.status(400).json({ message: error, status: false, data: [] });

    }
}


exports.verifyAndCreateToken = async (req, res) => {

    cors(req, res, async () => {
        const idToken = req.query.idToken

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken)
            let uid = decodedToken.uid;


            const customToken = await admin.auth().createCustomToken(uid);
            return res.status(200).json({ csToken: customToken });

        } catch (err) {
            console.log(err)
            return res.status(400).json('Could not verify token');
        }

    })

}


exports.sendEmail = async (req, res) => {

    cors(req, res, async () => {
        try {

            const mt = nodemailer.createTransport({
                host:"gmail.com",
                service: "gmail",
                port: 587,
                auth: {
                    user: "spaarklyvto@gmail.com",
                    pass: "ecdmcmtmexuxmntm"
                }
            });


            if (req.headers.ssk != SSK) return res.status(400).json('Could not verify token');

            const { from, to, subject, text, html } = req.body;
            if (!from || !to || !subject || !text || !html) {
                const emptyFields = [];

                if (!from) emptyFields.push('from, ');
                if (!to) emptyFields.push('to, ');
                if (!subject) emptyFields.push('subject');
                if (!text && !html) emptyFields.push('text or html');
                if (emptyFields.length > 0) return res.status(400).json(`The following fields are empty: ${emptyFields.join(', ')}`);
            }


            try {
                const result = mt.sendMail({
                    from: FROM,
                    to: to,
                    subject: subject,
                    text: text,
                    html: html
                })
                // console.log("RESULT", result);


                if (result) {
                    return res.status(200).json({ data: [], status: true, message: "Email sent" });
                } else {
                    console.log("ERROR", result);
                    res.status(400).json({ message: "Failed to send", data: [], status: false });
                }
            } catch (e) {
                console.log(e);
                res.status(400).json({ message: "Failed to send", data: [], status: false });
            }


        } catch (err) {
            console.log(err);
            return res.status(400).json({ message: "Failed to send - debugging", data: err, status: false });
        }

    })

}


