// // const { verifyAyah } = require( '../services/groqVerification' );
// import { verifyAyah } from '../services/groqVerification.js';
// import { verifyHarakatRecitation } from './quran.controller.js';


// const verifyRecitation = async ( req, res ) => {
//     const { spokenText, correctText, ayahReference } = req.body;

//     if ( !spokenText || !correctText ) {
//         return res.status( 400 ).json( { error: 'spokenText aur correctText dono required hain' } );
//     }

//     try {
//         const result = await verifyAyah( spokenText, correctText );
//         res.json( {
//             success: true,
//             ...result,
//             ayahReference
//         } );
//     } catch ( error ) {
//         console.error( error );
//         res.status( 500 ).json( { error: 'Verification failed' } );
//     }
// };

// export { verifyRecitation };
import { verifyAyah } from "../services/groqVerification.js";

export const verifyRecitation = async (req, res) => {
    const { spokenText, correctText, ayahReference } = req.body;

    if (!spokenText || !correctText) {
        return res.status(400).json({
            error: "spokenText aur correctText required hain"
        });
    }

    try {
        const result = await verifyAyah(spokenText, correctText);

        res.json({
            success: true,
            ...result,
            ayahReference
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Verification failed" });
    }
};  