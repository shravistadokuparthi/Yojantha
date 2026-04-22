const cron = require("node-cron");
const User = require("../models/User");
const Scheme = require("../models/Schemes");
const { sendEmail } = require("../utils/emailService");

/**
 * Schedule a job to run EVERY MINUTE for testing
 */
const initReminders = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Running Minute-Level Interested Scheme Reminders (Testing Mode)...");
    try {
      const users = await User.find({ "interestedSchemes.0": { $exists: true } });

      for (const user of users) {
        const now = new Date();
        const remindersToSend = [];

        for (const item of user.interestedSchemes) {
          const diffMinutes = Math.floor((now - new Date(item.addedAt)) / (1000 * 60));

          // Check if it's been exactly 2 or 3 minutes (window to avoid double-sending)
          if (diffMinutes === 2 || diffMinutes === 3) {
            const scheme = await Scheme.findById(item.schemeId);
            if (scheme) {
              remindersToSend.push(scheme.scheme_name);
            }
          }
        }

        if (remindersToSend.length > 0) {
          console.log(`Sending testing reminder to ${user.email} for ${remindersToSend.length} schemes`);
          await sendEmail({
            to: user.email,
            subject: "TEST REMINDER: Schemes in your list!",
            title: "Testing Mode: 2-Minute Reminder",
            body: `Hello ${user.name}, this is a test reminder. It has been 2 minutes since you showed interest in:
                  <br/><br/> 
                  <ul>${remindersToSend.map(name => `<li>${name}</li>`).join("")}</ul>`,
            ctaText: "Apply Now",
            ctaLink: "http://localhost:3000/my-schemes"
          });
        }
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};

module.exports = initReminders;
