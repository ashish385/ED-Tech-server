const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        })

        // SENDER
        let info = await transporter.sendMail({
            from: 'StudyNotion || Codehelp ~ Ashish Soni',
            to: `${email}`,
            subject: `${title}`,
            html:`${body}`
        })

        console.log("info", info);
        return info;
    } catch (error) {
        console.log("mail not sent");
        console.error(error);
    }
}

module.exports= mailSender