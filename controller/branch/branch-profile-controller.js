const tokenController = require("../token-controller");
module.exports = {
    branchProfileDetails: async (req, res) => {
        try {
            const userId = await tokenController.getUserID(req, res);
            const branchId = await tokenController.getBranchID(req, res);

            const usersData = await usersSchema
                .find({_id: userId})
                .select("name email_id mobile_no");

            const branchData = await branchSchema
                .find({_id: branchId});

            console.log(branchData)
            // res.send(usersData);
            // console.log(usersData);
            res.render(`${appPath}/branch/profile.ejs`, {
                usersData ,branchData
            });
        } catch (error) {
            // res.send("viewProfile error:" , error);
            console.log("viewProfile error: ", error);
        }
    }, branchFetchUserName: async (req, res) => {
        try {
            const userId = await tokenController.getUserID(req, res);
            const userName = await usersSchema.find({_id: userId}).select("name");
            // console.log(userName[0].name);
            res.status(200).send({
                success: true, userName: userName[0].name.toString(),
            });
        } catch (error) {
            console.log("fetchUserName error: ", error);
        }
    }
};
