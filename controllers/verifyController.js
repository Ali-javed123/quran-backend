// const { verifyAyah } = require( '../services/groqVerification' );
import { verifyAyah } from '../services/groqVerification.js';


const verifyRecitation = async ( req, res ) => {
    const { spokenText, correctText, ayahReference } = req.body;

    if ( !spokenText || !correctText ) {
        return res.status( 400 ).json( { error: 'Missing spokenText or correctText' } );
    }

    try {
        const result = await verifyAyah( spokenText, correctText );
        res.json( {
            success: true,
            ...result,
            ayahReference
        } );
    } catch ( error ) {
        console.error( error );
        res.status( 500 ).json( { error: 'Verification failed' } );
    }
};

export { verifyRecitation };