const mongoose = require("mongoose");
const { sendEmail } = require("../utils/emailService");

const schemeSchema = new mongoose.Schema({
  scheme_name: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  benefits: {
    type: String
  },
  eligibility: {
    type: String
  },
  schemeCategory: {
    type: String
  },
  state: {
    type: String
  },
  application: {
    type: String
  },
  documents: {
    type: String
  },
  tags: {
    type: String
  },
  embedding: {
    type: [Number],
    default: []
  }
}, { timestamps: true });

// Post-save hook to notify users about new schemes
schemeSchema.post("save", async function (doc) {
  // Use a simple async IIFE to not block the main thread
  (async () => {
    try {
      // Find all users with emails
      const User = mongoose.model("User");
      const users = await User.find({ email: { $exists: true } });
      
      console.log(`Notifying ${users.length} users about new scheme: ${doc.scheme_name}`);
      
      for (const user of users) {
        try {
          await sendEmail({
            to: user.email,
            subject: `New Scheme: ${doc.scheme_name}`,
            title: "New Scheme Alert! 📢",
            body: `Greetings ${user.name},<br/><br/>A new government scheme <b>"${doc.scheme_name}"</b> has just been added to the Yojanta portal. Don't miss out on potential benefits!`,
            ctaText: "Check Eligibility",
            ctaLink: "http://localhost:3000/schemes"
          });
        } catch (err) {
          console.error(`Failed to send email to ${user.email}:`, err.message);
        }
      }
    } catch (error) {
      console.error("New Scheme Notification Error:", error);
    }
  })();
});

module.exports = mongoose.model("Scheme", schemeSchema, "Govt_Schemes");