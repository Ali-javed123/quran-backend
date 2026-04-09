// const express = require( 'express' );
import { getSurahs, getAyahsBySurah, getParas, getAyahsByPara, getParaByPage, getSurahByPage, getSurahMeta, getParaMeta } from '../controllers/quranController.js';
import express from 'express';
// const { getSurahs, getAyahsBySurah, getParas, getAyahsByPara } = require( '../controllers/quranController' );
const router = express.Router();

router.get( '/surahs', getSurahs );
router.get( '/surahs/:suraIndex', getAyahsBySurah );
router.get( '/paras', getParas );
router.get( '/paras/:paraNo', getAyahsByPara );


router.get( "/paras/:paraNo/:page", getParaByPage );

router.get( "/surah/:surahNo/:page", getSurahByPage );


router.get( '/surah-meta/:suraIndex', getSurahMeta );
router.get( '/para-meta/:para_no', getParaMeta );

export default router;