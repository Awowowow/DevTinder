/*
const cron = require("node-cron");
const {subDays, startOfDay} = require("date-fns")
const sendEmail = require ("../sendEmail");
const startCronJobs = async() => {
  cron.schedule("* * * * *", async() => {

    try{
       const yesterday = subDays (new Date(), 1);

       const yesterdayStart = startOfDay(yesterday);
       const yesterdayEnd =  endOfDay(yesterday)

      const pendingRequest = await connectionRequestModel.find({
        status: "interested",
        createdAt:{
          $gte: yesterdayStart,
          $lt: yesterdayEnd
        }
      }).populate("fromUserId toUserId");

      const listOfEmails = [...new Set(pendingRequest.map(req => req.toUserId.emailId))];

      for(const email of listOfEmails){

        const res = await sendEmail.run("New Friend Request Pending for " toEmailID, "There are many friends request pending, please login to devconnect.lol to accept or request");
      }
    } catch(err){
      console.log(err)
    }
  });

};

module.exports = { startCronJobs };
*/