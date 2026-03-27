import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import Setting from '../models/Setting';

const SETTINGS_KEY = 'global';

export const getHeroImage = async (_req: Request, res: Response) => {
  try {
    const settings = await Setting.findOne({ key: SETTINGS_KEY }).select('heroImage');
    return res.json({
      success: true,
      heroImage: settings?.heroImage || '',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching hero image',
      error: error.message,
    });
  }
};

export const updateHeroImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file (jpg, jpeg, png, webp)',
      });
    }

    const heroImagePath = `/uploads/settings/${req.file.filename}`;
    const previous = await Setting.findOne({ key: SETTINGS_KEY }).select('heroImage');

    const settings = await Setting.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { key: SETTINGS_KEY, heroImage: heroImagePath },
      { new: true, upsert: true }
    );

    if (
      previous?.heroImage
      && previous.heroImage !== heroImagePath
      && previous.heroImage.startsWith('/uploads/settings/')
    ) {
      const previousFile = path.join(process.cwd(), previous.heroImage.replace(/^\/uploads\//, 'uploads/'));
      if (fs.existsSync(previousFile)) {
        fs.unlinkSync(previousFile);
      }
    }

    return res.json({
      success: true,
      message: 'Hero image updated successfully',
      heroImage: settings.heroImage || '',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error updating hero image',
      error: error.message,
    });
  }
};
