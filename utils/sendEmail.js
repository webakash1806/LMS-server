import nodemailer from 'nodemailer'


const sendEmail = async function (email, subject, message) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMPT_USERNAME,
            pass: process.env.SMPT_PASSWORD
        }
    });

    // async..await is not allowed in global scope, must use a wrapper
    // send mail with defined transport object
    await transporter.sendMail({
        from: '"Zenstudy" <zenstudy@gmail.com>', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        // text: "Hello world?", // plain text body
        html: message, // html body
    });

    console.log(message)

    // console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    //
    // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
    //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
    //       <https://github.com/forwardemail/preview-email>
    //
}

export default sendEmail