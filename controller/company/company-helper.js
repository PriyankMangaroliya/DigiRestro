const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'views/uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueFilename = Date.now() + ext;
        cb(null, uniqueFilename);
    },
});

const upload = multer({storage});

const fetchAndFormatCompanies = async (userId, req) => {
    try {

        const companies = await companySchema.find({user_id: new mongoose.Types.ObjectId(userId)});

        if (companies.length > 0 && req.session.selectedCompanyId === undefined) {
            const selectedCompany = companies[0];
            setDefaultCompanySession(selectedCompany, req.session);
        }

        return companies.map(company => ({
            _id: company._id.toString(),
            user_id: company.user_id.toString(),
            company_name: company.company_name,
            legal_name: company.legal_name,
            company_logo: company.company_logo
        }));
    } catch (error) {
        console.error("Error in fetchAndFormatCompanies:", error);
        throw error;
    }
};

const setDefaultCompany = async (userId, req) => {

    if (_.isUndefined(req.session.selectedCompanyId)) {
        console.log("Setting default company");

        const formattedCompanies = await fetchAndFormatCompanies(userId, req);
        if (formattedCompanies.length > 0) {
            const selectedCompany = await companySchema.findById(formattedCompanies[0]._id);

            // Set the default company in session
            setDefaultCompanySession(selectedCompany, req.session);
        }
    }
};

const setDefaultCompanySession = (company, session) => {
    session.selectedCompanyId = company._id;
    session.selectedLegalName = company.company_name;
    session.selectedCompanyLogo = company.company_logo;
};

const handleAuthRedirect = (callback, res, redirectUrl) => {
    if (callback.callback && callback.role_name === "O") {
        return true;
    } else {
        res.redirect(redirectUrl);
        return false;
    }
};

module.exports = {
    upload,
    handleAuthRedirect,
    fetchAndFormatCompanies,
    setDefaultCompany,
    setDefaultCompanySession,
};
