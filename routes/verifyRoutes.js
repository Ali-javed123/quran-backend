// const express = require( 'express' );
import { verifyRecitation } from '../controllers/verifyController.js';
import express from 'express';
// const { verifyRecitation } = require( '../controllers/verifyController' );
const router = express.Router();

router.post( '/verify', verifyRecitation );

export default router;