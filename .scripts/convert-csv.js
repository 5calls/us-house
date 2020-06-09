var fs = require('fs');
var csv = require('fast-csv');
var pjson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
var values = require('object.values');
var slug = require('slug');
var parser = require('parse-address');

if (!Object.values) {
  values.shim();
}

var core = 'source/us-house.csv';
var converted = 'us-house/data/us-house.csv';
var currentRow = 0;

if (fs.existsSync(core)) {
  fs.truncate(converted, 0, function() {
    var stream = fs.createReadStream(core);

    csv.fromStream(stream, {headers : true}).validate(function(data){

      var validGender = [
        'female',
        'male',
        'unspecified'
      ];

      var validEthnicity = [
        'african-american',
        'asian-american',
        'hispanic-american',
        'middle-eastern-american',
        'multi-racial-american',
        'native-american',
        'pacific-islander',
        'white-american',
        'unspecified'
      ];

      var validTitle = [
        'representative',
        'house-speaker',
        'house-majority-leader',
        'house-majority-whip',
        'house-minority-leader',
        'house-minority-whip',
        'republican-conference-chairman',
        'republican-policy-committee-chairman',
        'assistant-democratic-leader',
        'democratic-caucus-chairman'
      ];

      var validParty = [
        'constitution',
        'democrat',
        'green',
        'independent',
        'libertarian',
        'nonpartisan',
        'republican'
      ];

      if (data.vacant !== 'yes' && data.state === '') {
        console.error('× Missing Required State');
        return false;
      } else if (data.vacant !== 'yes' && data.state_code === '') {
        console.error('× Missing Required State Code');
        return false;
      } else if (data.vacant !== 'yes' && data.state_code === '') {
        console.error('× Missing Required State Code');
        return false;
      } else if (data.vacant !== 'yes' && data.first_name === '') {
        console.error('× Missing Required First Name');
        return false;
      } else if (data.vacant !== 'yes' && data.last_name === '') {
        console.error('× Missing Required Last Name');
        return false;
      } else if (data.vacant !== 'yes' && validGender.indexOf(data.gender) === -1) {
        console.error('× Invalid Gender for ' + data.first_name + ' ' + data.last_name);
        return false;
      } else if (data.vacant !== 'yes' && validEthnicity.indexOf(data.ethnicity) === -1) {
        console.error('× Invalid Ethnicity for ' + data.first_name + ' ' + data.last_name);
        return false;
      } else if (data.vacant !== 'yes' && data.date_of_birth !== '' && !/^([0-9]{4}-[0-9]{2}-[0-9]{2})$/.test(data.date_of_birth)) {
        console.error('× Invalid Date or Birth for ' + data.first_name + ' ' + data.last_name);
        return false;
      } else if (data.vacant !== 'yes' && validTitle.indexOf(data.title) === -1) {
        console.error('× Invalid Title for ' + data.first_name + ' ' + data.last_name);
        return false;
      } else if (data.vacant !== 'yes' && validParty.indexOf(data.party) === -1) {
        console.error('× Invalid Party for ' + data.first_name + ' ' + data.last_name);
        return false;
      } else if (data.vacant !== 'yes' && data.phone !== '' && !/^([0-9]{3}-[0-9]{3}-[0-9]{4})$/.test(data.phone)) {
        console.error('× Invalid Phone Number for ' + data.first_name + ' ' + data.last_name);
        return false;
      } else if (data.vacant !== 'yes' && data.address === '') {
        console.error('× Missing Required Address for ' + data.first_name + ' ' + data.last_name);
        return false;
      } else if (data.vacant !== 'yes' && data.twitter_url !== '' && data.twitter_url.indexOf('https://twitter.com/') === -1) {
        console.error('× Invalid Twitter URL for ');
        return false;
      } else if (data.vacant !== 'yes' && data.facebook_url !== '' && data.facebook_url.indexOf('https://facebook.com') === -1) {
        console.error('× Invalid Facebook URL for ' + data.first_name + ' ' + data.last_name);
        return false;
      }

      return true;
    })
    .on('data-invalid', function(){
      console.error('× Aborted Converting CSV File');
      process.exit(1);
    })
    .on('data', function(data){

      var cdnHeadshotPath = (data.vacant === 'yes') ? '' : 'https://repimages.5calls.org/us-house/512x512/' +
        slug(data.first_name + ' ' + data.last_name, { lower: true, replacement: '-' }) + '.jpg';

      var parsedAddress = parser.parseLocation(data.address);

      if (!parsedAddress) {
        parsedAddress = {
          number: '',
          prefix: '',
          street: '',
          sec_unit_type: '',
          sec_unit_num: '',
          city: '',
          state: '',
          zip: '',
          type: ''
        }
      }

      var convertedData = {
        state_name: data.state,
        state_name_slug: slug(data.state, { lower: true, replacement: '-' }),
        state_code: data.state_code,
        state_code_slug: slug(data.state_code, { lower: true, replacement: '-' }),
        district: (data.district && data.district !== '' && data.district !== '0' && data.district !== 0) ? data.district : null,
        at_large: (data.at_large && data.at_large === 'yes'),
        vacant: (data.vacant && data.vacant === 'yes'),
        bioguide: data.bioguide,
        thomas: data.thomas,
        opensecrets: data.opensecrets,
        votesmart: data.votesmart,
        fec: data.fec,
        maplight: data.maplight,
        wikidata: data.wikidata,
        google_entity_id: data.google_entity_id,
        title: data.title,
        party: data.party,
        name: data.first_name + ' ' + data.last_name,
        name_slug: slug(data.first_name + ' ' + data.last_name, { lower: true, replacement: '-' }),
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        name_suffix: data.name_suffix,
        goes_by: data.goes_by,
        pronunciation: data.pronunciation,
        gender: data.gender,
        ethnicity: data.ethnicity,
        religion: data.religion,
        openly_lgbtq: data.openly_lgbtq || 'no',
        date_of_birth: data.date_of_birth,
        entered_office: data.entered_office,
        term_end: data.term_end,
        biography: data.biography,
        phone: data.phone,
        fax: data.fax,
        latitude: data.latitude,
        longitude: data.longitude,
        address_complete: data.address,
        address_number: parsedAddress.number || null,
        address_prefix: parsedAddress.prefix || null,
        address_street: parsedAddress.street || null,
        address_sec_unit_type: parsedAddress.sec_unit_type || null,
        address_sec_unit_num: parsedAddress.sec_unit_num || null,
        address_city: parsedAddress.city || null,
        address_state: parsedAddress.state || null,
        address_zipcode: parsedAddress.zip || null,
        address_type: parsedAddress.type || null,
        website: data.website,
        contact_page: data.contact_page,
        facebook_url: data.facebook_url,
        twitter_handle: (data.twitter_url) ? data.twitter_url.replace('https://twitter.com/', '') : null,
        twitter_url: data.twitter_url,
        photo_url: cdnHeadshotPath
      };

      if (currentRow === 0) {
        var header = Object.keys(convertedData).join(',') + '\n';
        fs.appendFile(converted, header);
      }

      var row = '"' + Object.values(convertedData).join('","').replace(/""/g, '') + '"' + '\n';
      fs.appendFile(converted, row);

      console.log('✓ Processed ' + data.first_name + ' ' + data.last_name);

      currentRow++;
    })
    .on('end', function(){
      console.log('\n☆ CSV Process Completed ' + '\n');
    });
  });
} else {
  console.log(path + ' not found');
}
