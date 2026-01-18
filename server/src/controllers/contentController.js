const prisma = require('../utils/prisma');
const crypto = require('crypto');

// Privacy Policy
exports.getPrivacyPolicy = async (req, res) => {
    try {
        let privacy = await prisma.privacyPolicy.findFirst();

        // If not exists, return empty
        if (!privacy) {
            return res.json({
                success: true,
                data: {
                    contentEn: '',
                    contentAr: ''
                }
            });
        }

        res.json({
            success: true,
            data: privacy
        });
    } catch (error) {
        console.error('Get privacy policy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching privacy policy',
            error: error.message
        });
    }
};

exports.createOrUpdatePrivacyPolicy = async (req, res) => {
    try {
        const { contentEn, contentAr } = req.body;

        if (!contentEn && !contentAr) {
            return res.status(400).json({
                success: false,
                message: 'At least one content field is required'
            });
        }

        let privacy = await prisma.privacyPolicy.findFirst();

        if (privacy) {
            // Update existing
            privacy = await prisma.privacyPolicy.update({
                where: { id: privacy.id },
                data: {
                    contentEn: contentEn || privacy.contentEn,
                    contentAr: contentAr || privacy.contentAr,
                    updatedAt: new Date()
                }
            });
        } else {
            // Create new
            privacy = await prisma.privacyPolicy.create({
                data: {
                    id: crypto.randomUUID(),
                    contentEn: contentEn || '',
                    contentAr: contentAr || '',
                    updatedAt: new Date()
                }
            });
        }

        res.json({
            success: true,
            message: 'Privacy policy saved successfully',
            data: privacy
        });
    } catch (error) {
        console.error('Save privacy policy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving privacy policy',
            error: error.message
        });
    }
};

// Terms of Service
exports.getTermsOfService = async (req, res) => {
    try {
        let terms = await prisma.termsOfService.findFirst();

        if (!terms) {
            return res.json({
                success: true,
                data: {
                    contentEn: '',
                    contentAr: ''
                }
            });
        }

        res.json({
            success: true,
            data: terms
        });
    } catch (error) {
        console.error('Get terms of service error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching terms of service',
            error: error.message
        });
    }
};

exports.createOrUpdateTermsOfService = async (req, res) => {
    try {
        const { contentEn, contentAr } = req.body;

        if (!contentEn && !contentAr) {
            return res.status(400).json({
                success: false,
                message: 'At least one content field is required'
            });
        }

        let terms = await prisma.termsOfService.findFirst();

        if (terms) {
            terms = await prisma.termsOfService.update({
                where: { id: terms.id },
                data: {
                    contentEn: contentEn || terms.contentEn,
                    contentAr: contentAr || terms.contentAr,
                    updatedAt: new Date()
                }
            });
        } else {
            terms = await prisma.termsOfService.create({
                data: {
                    id: crypto.randomUUID(),
                    contentEn: contentEn || '',
                    contentAr: contentAr || '',
                    updatedAt: new Date()
                }
            });
        }

        res.json({
            success: true,
            message: 'Terms of service saved successfully',
            data: terms
        });
    } catch (error) {
        console.error('Save terms of service error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving terms of service',
            error: error.message
        });
    }
};

// About App
exports.getAboutApp = async (req, res) => {
    try {
        let about = await prisma.aboutApp.findFirst();

        if (!about) {
            return res.json({
                success: true,
                data: {
                    titleEn: '',
                    titleAr: '',
                    descriptionEn: '',
                    descriptionAr: '',
                    version: '',
                    imageEn: '',
                    imageAr: ''
                }
            });
        }

        res.json({
            success: true,
            data: about
        });
    } catch (error) {
        console.error('Get about app error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching about app',
            error: error.message
        });
    }
};

exports.createOrUpdateAboutApp = async (req, res) => {
    try {
        const { titleEn, titleAr, descriptionEn, descriptionAr, version, imageEn, imageAr } = req.body;

        let about = await prisma.aboutApp.findFirst();

        const data = {};
        if (titleEn !== undefined) data.titleEn = titleEn;
        if (titleAr !== undefined) data.titleAr = titleAr;
        if (descriptionEn !== undefined) data.descriptionEn = descriptionEn;
        if (descriptionAr !== undefined) data.descriptionAr = descriptionAr;
        if (version !== undefined) data.version = version;
        if (imageEn !== undefined) data.imageEn = imageEn;
        if (imageAr !== undefined) data.imageAr = imageAr;

        if (about) {
            about = await prisma.aboutApp.update({
                where: { id: about.id },
                data: {
                    ...data,
                    updatedAt: new Date()
                }
            });
        } else {
            about = await prisma.aboutApp.create({
                data: {
                    id: crypto.randomUUID(),
                    titleEn: titleEn || '',
                    titleAr: titleAr || '',
                    descriptionEn: descriptionEn || '',
                    descriptionAr: descriptionAr || '',
                    version: version || '',
                    imageEn: imageEn || '',
                    imageAr: imageAr || '',
                    updatedAt: new Date()
                }
            });
        }

        res.json({
            success: true,
            message: 'About app saved successfully',
            data: about
        });
    } catch (error) {
        console.error('Save about app error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving about app',
            error: error.message
        });
    }
};

