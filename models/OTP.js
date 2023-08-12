const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

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
        expires: 5 * 60,
    }
});

// a functio -> send a mail
async function sendVerificationMail(email, otp) {
    try {
        const mailRespons = await mailSender(email, "Verification mail from StudyNotion", otp);
        console.log("Email sent successfully!",mailRespons);
    } catch (error) {
        console.log("error occured while sending mails: ", error);
        throw error;
    }
}

otpSchema.pre("save", async function (next) {
    await sendVerificationMail(this.mail, this.otp);
    next();
})

module.exports = mongoose.model("OTP", otpSchema);