// const express = require( 'express' );
import { getSurahs, getAyahsBySurah, getParas, getAyahsByPara, getParaByPage, getSurahByPage, getSurahMeta, getParaMeta } from '../controllers/quranController.js';
import { cache } from "../middleware/cache.middleware.js";

import express from 'express';
// const { getSurahs, getAyahsBySurah, getParas, getAyahsByPara } = require( '../controllers/quranController' );
const router = express.Router();

// without caching
// router.get( '/surahs', getSurahs );
// router.get( '/surahs/:suraIndex', getAyahsBySurah );
// router.get( '/paras', getParas );
// router.get( '/paras/:paraNo', getAyahsByPara );


// router.get( "/paras/:paraNo/:page", getParaByPage );

// router.get( "/surah/:surahNo/:page", getSurahByPage );


// router.get( '/surah-meta/:suraIndex', getSurahMeta );
// router.get( '/para-meta/:para_no', getParaMeta );



router.get( "/surahs", cache( "surahs" ), getSurahs );

router.get( "/surahs/:suraIndex", cache( "surah" ), getAyahsBySurah );

router.get( "/paras", cache( "paras" ), getParas );

router.get( "/paras/:paraNo", cache( "para" ), getAyahsByPara );

router.get( "/paras/:paraNo/:page", cache( "paraPage" ), getParaByPage );

router.get( "/surah/:surahNo/:page", cache( "surahPage" ), getSurahByPage );

router.get( "/surah-meta/:suraIndex", cache( "surahMeta" ), getSurahMeta );

router.get( "/para-meta/:para_no", cache( "paraMeta" ), getParaMeta );


export default router;