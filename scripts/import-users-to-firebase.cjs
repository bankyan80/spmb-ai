const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'spmb-ai', credential: admin.credential.applicationDefault() });

const users = [
  { uid: '0WUmasEzHCeLgIivwAUf7JFHork1', nama: 'Garnis N.F', email: 'garnis589@gmail.com' },
  { uid: '72pYPzOKp2Y6gWORApuQ31mdAOM2', nama: 'Fajar Sidik', email: 'fajarsidik10.id@gmail.com' },
  { uid: '8oTmoHc8oeZR6GRsBBJ4wExuRg53', nama: 'gina maulidah', email: 'ginamaulidah26@gmail.com' },
  { uid: '9yfxqVztRraRktPkjE3jG1ExUiC2', nama: 'SD NEGERI 1 SIGONG', email: 'sdnegerisigong1@gmail.com' },
  { uid: 'CaqthbevHLRkeEp28TMzpRCsxw22', nama: 'Luthfi Firmansyah', email: 'luthfifirmansyah78@admin.sd.belajar.id' },
  { uid: 'DN9BApPjBfOR0UVDg1usVRwtNFp1', nama: 'SD NEGERI 1 CIPEUJEUH KULON', email: 'sdnegeri1cipeujeuhkulon@gmail.com' },
  { uid: 'KuTzWsWOORZ2FJoTTR0dmug7aCC3', nama: 'SDN 3 Cipeujeuh Wetan', email: 'sdn3cipwet@gmail.com' },
  { uid: 'LM39IQWnXpXw2BWHXwth34raNSE3', nama: 'SDN 1 LEMAHABANG', email: 'sdnsatulemahabang@gmail.com' },
  { uid: 'NOEyh4jhdqOAmc21iHRpMAdhyvq1', nama: 'Luthfi Firmansyah', email: 'lut.firman88@gmail.com' },
  { uid: 'Ps8I4gX43dRYYHzrtgG73QjMG0u2', nama: 'SDN 1 PICUNGPUGUR', email: 'sdn1picungpugur01@gmail.com' },
  { uid: 'QBrtbiFXSjcjs8iA8iEpMcGvfhp1', nama: 'SDN 2 SARAJAYA', email: 'sdnsarajayadua@gmail.com' },
  { uid: 'R1Pv8CgSiAb4UA4UAlUbfK9Mi8h1', nama: 'spmb-sd 2026', email: 'spmb.sd.017@gmail.com' },
  { uid: 'SYdrDc6flccSQlzeJO4k5Sn0RLj2', nama: 'Diyan Hidayat', email: 'diyan.hidayat93@gmail.com' },
  { uid: 'Y7nBxv0GcMgo8get9Uc9Y4HLT7G3', nama: 'SD NEGERI 1 CIPEUJEUH WETAN', email: 'sdncipwet1@gmail.com' },
  { uid: 'hMsMiQcHuObkNzAQRfGBgppB1a32', nama: 'SDIT AL IRSYAD AL ISLAMIYYAH LEMAHABANG KAB CIREBON', email: 'sditalirsyadla@gmail.com' },
  { uid: 'pfeBqUGnyUXePHcTAnXsiNXdBZP2', nama: 'nurdin ramadon', email: 'nurdinramadon590@gmail.com' },
  { uid: 'qQFdtWtvyGMNAETaRPKP4IZEt033', nama: 'sdn1 sindanglaut', email: 'sdnsatusindanglaut@gmail.com' },
  { uid: 'teOk9YZWnqNfXatnvcnDyO20aMD2', nama: 'Shepta Wijaya', email: 'shepta24@gmail.com' },
  { uid: 'v2bLEHet9rcA4S1ehCzWBqEsjwE3', nama: 'Sdnsatu Wangkelang', email: 'sdnsatuw@gmail.com' },
  { uid: 'vZfr6hJYqRhS15rBjtGUrnmnoPT2', nama: 'Jaja', email: 'jajacrb21@gmail.com' },
  { uid: 'xSY97tqZcKTGoaJZmR0Z20993KH3', nama: 'sdn2 cipeujeuhkulon', email: 'sdncipeujeuhkulon2@gmail.com' },
  { uid: 'c5WcxuExJmSIvmxMrygwXHwr0A83', nama: 'sdndua cipeujeuhwetan', email: 'sdnduacipeujeuhwetan@gmail.com' },
  { uid: 'kdPlDz5cMaZQtMtsS4XDTZhjkQF2', nama: 'endang kasmara', email: 'endangkasmara679@gmail.com' },
  { uid: 'sB0iLrghppTANSud1sJpmB4HlR82', nama: 'MAMAN JOHARI', email: 'mamanjohari0607@gmail.com' },
];

const password = 'spmb2026';

async function main() {
  let created = 0, updated = 0, errors = 0;
  for (const u of users) {
    try {
      const existing = await admin.auth().getUser(u.uid).catch(() => null);
      if (existing) {
        await admin.auth().updateUser(u.uid, {
          displayName: u.nama,
          email: u.email,
          password,
        });
        console.log(`[UPDATE] ${u.nama} (${u.email})`);
        updated++;
      } else {
        await admin.auth().createUser({
          uid: u.uid,
          displayName: u.nama,
          email: u.email,
          password,
        });
        console.log(`[CREATE] ${u.nama} (${u.email})`);
        created++;
      }
    } catch (err) {
      console.error(`[ERROR] ${u.nama}: ${err.message}`);
      errors++;
    }
  }
  console.log(`\nDone: ${created} created, ${updated} updated, ${errors} errors`);
  await admin.app().delete();
}

main().catch(console.error);
