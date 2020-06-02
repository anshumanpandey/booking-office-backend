const debuglog = require('util').debuglog('app');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

/*we cannot use right cars email now due to the following error
Hostname / IP does not match certificate's altnames: Host: zimbra.right-cars.com. is not in the cert's altnames: DNS: production.right - cars.com, DNS: www.production.right - cars.com
const transporter = nodemailer.createTransport({
    host: 'zimbra.right-cars.com',
    port: 587,
    auth: {
        user: 'noreply@right-cars.com',
        pass: 'nat120F!!'
    }
});
*/
///
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
});

function send(to, subject, body) {
    //Turn off mailing if not on production
    if (process.env.MAILING_ENABLE !== 'true' || process.env.DEV || process.env.OFFLINE || process.env.NODE_DEBUG || (
        typeof v8debug === 'object' || /--debug|--inspect/.test(process.execArgv.join(' '))
    )) {
        console.log(`skip mail sending on dev mode`)
        return Promise.resolve();
    }

    debuglog(`sending email to ${to} with subject ${subject}`)
    const mailOptions = {
        from: process.env.EMAIL, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: body
    };

    return new Promise((resolve, rejected) => {
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                debuglog(`mail send failed with error`)
                debuglog(err)
                rejected(err);
            }
            else {
                debuglog(`mail sended successfully!`)
                resolve(info);
            }
        });
    });
}

module.exports = {
    send
}