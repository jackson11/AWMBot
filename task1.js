const mwn = require('mwn')
const fs = require('fs');


function pluck(array, key) {
  return array.map(o => o[key]);
}

const bot = new mwn({
    apiUrl: 'https://en.wikipedia.org/w/api.php',
    username: username,
    password: password
});


bot.loginGetToken()
  .then((data)=>{
    bot.setUserAgent('AWMBot v1.0 ([[w:en:BJackJS]])/mwn');
    start()
  })
  .catch((d2)=>{
    console.log(d2)
  })



function start(){
var pagemembers = {} 

bot.request({
	"action": "query",
	"list": "categorymembers",
  "cmtitle":"Category:Pages_using_Template:Old_peer_review_with_broken_archive_link",
  "cmlimit": "1",
	"cmprop": "ids|title|type",
}).then(data => {
	bot.request({
	  "action": "query",
	  "prop": "redirects",
    "rdlimit": "max",
    "pageids": pluck(data.query.categorymembers,"pageid"),
  })
    .then(redirects => {
	    redirects.query.pages.forEach((iter)=>{
        if (iter.redirects){
          pagemembers[iter.title]=iter
        }
      })
      bot.request({
        "action": "query",
        "prop": "revisions",
        "rvslots": "*",
        "rvprop": "content",
        "pageids": pluck(data.query.categorymembers,"pageid"),
      })
      .then(parsed => {
        parsed.query.pages.forEach((revcon)=>{
        var redirtitle = pagemembers[revcon.title].redirects[pagemembers[revcon.title].redirects.length].title.split(":")[1]
        var locatestring = /{{Old peer review|archive = 1}}/
        var replacestring = "{{Old peer review|"+"reviewedname="+redirtitle+"|archive = 1}}"
        var formtext = revcon.revisions[0].slots.main.content
        var wikitext = formtext.replace(locatestring,replacestring)
        bot.edit(revcon.title, rev => {
          // rev.content gives the revision text
          // rev.timestamp gives the revision timestamp
        
          return {  // return parameters needed for [[mw:API:Edit]]
            text: wikitext,
            summary: 'hopefully fixed incorrect revision',
            minor: true
          }
        })
          .then((data)=>{
            console.log(data)
          })
          .catch((bbb)=>{
            console.log(bbb)
        

        });
      })
      })
  });
});
}
