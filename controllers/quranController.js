// const Ayah = require( '../models/Ayah' );
import Ayah from '../models/Ayah.js';




const getSurahs = async ( req, res ) => {
  try {
    const surahs = await Ayah.aggregate( [
      {
        $sort: { ayaIndex: 1 } // pehle ayaIndex ke hisaab se sort kar do
      },
      {
        $group: {
          _id: "$suraIndex",
          surah_name: { $first: "$surah_name" } // ab surah_name directly uthao
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          suraIndex: "$_id",
          surah_name: 1
        }
      }
    ] );

    res.json( surahs );
  } catch ( err ) {
    console.log( err );
    res.status( 500 ).json( { error: "Failed to fetch surahs" } );
  }
};
// Get all surahs (unique suraIndex with names)
// Get ayahs for a specific surah with pagination (16 ayahs per page)
// const getAyahsBySurah = async ( req, res ) => {
//   const { suraIndex } = req.params;
//   let { page = 1, limit = 16, mode = 'normal' } = req.query;
//   page = parseInt( page );
//   limit = parseInt( limit );
//   const skip = ( page - 1 ) * limit;

//   const ayahs = await Ayah.find( { suraIndex: parseInt( suraIndex ) } )
//     .sort( { ayaIndex: 1 } )
//     .skip( skip )
//     .limit( limit )
//     .lean();

//   const total = await Ayah.countDocuments( { suraIndex: parseInt( suraIndex ) } );

//   // Return either normal text or tajweed (HTML) version
//   const data = ayahs.map( ayah => ( {
//     ayaIndex: ayah.ayaIndex,
//     text: mode === 'tajweed' ? ayah.textTajweed : ayah.text,
//     page_no: ayah.page_no,
//     para_no: ayah.para_no
//   } ) );

//   res.json( {
//     suraIndex,
//     page,
//     totalPages: Math.ceil( total / limit ),
//     ayahs: data
//   } );
// };
// const getAyahsBySurah = async ( req, res ) => {
//   const { suraIndex } = req.params;
//   let { page = 1, limit = 16, mode = 'normal' } = req.query;

//   page = parseInt( page );
//   limit = parseInt( limit );
//   const skip = ( page - 1 ) * limit;

//   const ayahs = await Ayah.find( { suraIndex: parseInt( suraIndex ) } )
//     .sort( { ayaIndex: 1 } )
//     .skip( skip )
//     .limit( limit )
//     .lean();

//   const total = await Ayah.countDocuments( { suraIndex: parseInt( suraIndex ) } );

//   const data = ayahs.map( ayah => ( {
//     ...ayah, // ✅ full mongo object
//     text: mode === 'tajweed' ? ayah.textTajweed : ayah.text
//   } ) );

//   res.json( {
//     suraIndex,
//     page,
//     totalPages: Math.ceil( total / limit ),
//     ayahs: data
//   } );
// };
const getAyahsBySurah = async ( req, res ) => {
  const { suraIndex } = req.params;
  let { page = 1, limit = 16, mode = 'normal', all = false } = req.query;

  page = parseInt( page );
  limit = parseInt( limit );

  const query = Ayah.find( { suraIndex: parseInt( suraIndex ) } ).sort( { ayaIndex: 1 } ).lean();

  if ( !all ) {
    const skip = ( page - 1 ) * limit;
    query.skip( skip ).limit( limit );
  }

  const ayahs = await query;

  const data = ayahs.map( ayah => ( {
    ...ayah,
    text: mode === 'tajweed' ? ayah.textTajweed : ayah.text
  } ) );

  res.json( {
    suraIndex,
    totalAyahs: ayahs.length,
    ayahs: data
  } );
};

// Get all paras (1-30)
const getParas = async ( req, res ) => {
  try {
    const paras = await Ayah.aggregate( [
      { $sort: { ayaIndex: 1 } }, // make sure ayahs are sorted within para
      {
        $group: {
          _id: "$para_no",              // group by para_no
          surah_name: { $first: "$para_name" }, // take first surah_name in this para
          ayahCount: { $sum: 1 }       // count of ayahs in this para
        }
      },
      { $sort: { _id: 1 } },          // sort by para_no ascending
      {
        $project: {
          _id: 0,
          para_no: "$_id",
          surah_name: 1,
          ayahCount: 1
        }
      }
    ] );

    res.json( paras );
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json( { error: "Failed to fetch paras" } );
  }
};
// Get ayahs by para number with pagination
// const getAyahsByPara = async ( req, res ) => {
//     const { paraNo } = req.params;
//     let { page = 1, limit = 16, mode = 'normal' } = req.query;

//     page = parseInt( page );
//     limit = parseInt( limit );

//     const skip = ( page - 1 ) * limit;

//     const allAyahs = await Ayah.find( { para_no: parseInt( paraNo ) } )
//         .sort( { globalIndex: 1 } )
//         .lean();

//     const total = allAyahs.length;

//     const ayahs = allAyahs.slice( skip, skip + limit );

//     const data = ayahs.map( ( ayah ) => ( {
//         ...ayah,
//         text: mode === 'tajweed' ? ayah.textTajweed : ayah.text,
//     } ) );

//     res.json( {
//         paraNo,
//         page,
//         totalPages: Math.ceil( total / limit ),
//         ayahs: data,
//     } );
// };


const getAyahsByPara = async ( req, res ) => {
  try {
    const { paraNo } = req.params;
    let { page = 1, limit = 16, mode = 'normal' } = req.query;

    page = parseInt( page );
    limit = parseInt( limit );

    const skip = ( page - 1 ) * limit;

    const allAyahs = await Ayah.find( {
      para_no: parseInt( paraNo ),
    } )
      .sort( { globalIndex: 1 } )
      .lean();

    const total = allAyahs.length;

    const paginatedAyahs = allAyahs.slice( skip, skip + limit );

    const ayahs = paginatedAyahs.map( ( ayah ) => {
      return {
        ...ayah, // 👈 pura object aa jayega
        text: mode === 'tajweed' ? ayah.textTajweed : ayah.text,
      };
    } );

    res.json( {
      paraNo: Number( paraNo ),
      page,
      totalPages: Math.ceil( total / limit ),
      ayahs,
    } );
  } catch ( error ) {
    console.error( error );
    res.status( 500 ).json( { message: "Server Error" } );
  }
};





const getParaByPage = async ( req, res ) => {
  try {
    const { paraNo, page } = req.params;

    const ayahs = await Ayah.find( {
      para_no: Number( paraNo ),
      page_no: Number( page )
    } ).sort( { globalIndex: 1 } );

    res.json( {
      paraNo,
      page,
      totalLines: ayahs.length, // ideally 15-16
      ayahs
    } );

  } catch ( error ) {
    res.status( 500 ).json( { error: error.message } );
  }
};

const getSurahByPage = async ( req, res ) => {
  try {
    const { surahNo, page } = req.params;

    // 🔹 Ensure numbers
    const surahIndexNum = Number( surahNo );
    const pageNum = Number( page );

    if ( isNaN( surahIndexNum ) || isNaN( pageNum ) ) {
      return res.status( 400 ).json( { error: 'Invalid surahNo or page number' } );
    }

    // 🔹 Query only if page_no exists
    const ayahs = await Ayah.find( {
      suraIndex: surahIndexNum,
      page_no: { $eq: pageNum }   // safe for null
    } ).sort( { globalIndex: 1 } );

    res.json( {
      surahNo: surahIndexNum,
      page: pageNum,
      totalLines: ayahs.length,
      ayahs
    } );

  } catch ( error ) {
    res.status( 500 ).json( { error: error.message } );
  }
};


const getSurahMeta = async ( req, res ) => {
  const { suraIndex } = req.params;

  const firstAyah = await Ayah.findOne( { suraIndex: parseInt( suraIndex ) } )
    .sort( { ayaIndex: 1 } )
    .lean();

  res.json( {
    suraIndex,
    startPage: firstAyah?.page_no || 1
  } );
};
const getParaMeta = async ( req, res ) => {
  const { para_no } = req.params;

  const firstAyah = await Ayah.findOne( { para_no: parseInt( para_no ) } )
    .sort( { globalIndex: 1 } ) // ya ayaIndex bhi use kar sakte ho
    .lean();

  res.json( {
    para_no: Number( para_no ),
    startPage: firstAyah?.page_no || 1,
    paraName: firstAyah?.para_name || ''
  } );
};
export { getSurahs, getAyahsBySurah, getParas, getAyahsByPara, getParaByPage, getSurahByPage, getSurahMeta, getParaMeta };