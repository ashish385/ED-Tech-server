const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templets/emailVerificationTemplet");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 60*5,
    }
});

// a functio -> send a mail
async function sendVerificationMail(email, otp) {
    try {
        const mailRespons = await mailSender(email, "Verification mail from StudyNotion", emailTemplate(otp));
        console.log("Email sent successfully!",mailRespons);
    } catch (error) {
        console.log("error occured while sending mails: ", error);
        throw error;
    }
}

otpSchema.pre("save", async function (next) {
    console.log("New document saved to database");

	// Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationMail(this.email, this.otp);
	}
	next();
    // await sendVerificationMail(this.mail, this.otp);
    // next();
})

module.exports = mongoose.model("OTP", otpSchema);