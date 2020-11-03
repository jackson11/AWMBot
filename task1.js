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
  "cmlimit": "10",
	"cmprop": "ids|title|type",
}).then(data => {
  console.log(pluck(data.query.categorymembers,"pageid"))
	bot.request({
	  "action": "query",
	  "prop": "redirects",
    "rdlimit": "max",
    "pageids": pluck(data.query.categorymembers,"pageid"),
  })
    .then(function(redirects) {
      var ids = []
	    redirects.query.pages.forEach((iter)=>{
        if (iter.redirects){
          pagemembers[iter.title]=iter
          ids.push(iter.pageid)
          console.log(iter)
        }
      })
      bot.request({
        "action": "query",
        "prop": "revisions",
        "rvslots": "*",
        "rvprop": "content",
        "pageids": ids
      })
      .then(parsed => {  
        parsed.query.pages.forEach((revcon)=>{
        /*console.log(revcon)
        var redirtitle = console.log(pagemembers)//.redirects[0]).title.split(":")[1]
        console.log(revcon)
        var locatestring2 = /{{Old peer review/
        var locatestring = /{{oldpeerreview/
        var replacestring = "{{Old peer review|"+"reviewedname="+redirtitle
        var formtext = revcon.revisions[0].slots.main.content
        
        //console.log(wikitext,formtext)
        bot.edit(revcon.title, rev => {
          // rev.content gives the revision text
          // rev.timestamp gives the revision timestamp
          var wikitext = rev.content.replace(locatestring,replacestring).replace(locatestring2,replacestring)

          return {  // return parameters needed for [[mw:API:Edit]]
            text: wikitext,
            summary: 'Fixing broken old peer review link.',
            minor: true,
            bot: true
          }
        })
          .then((data)=>{
            console.log(data)
          })
          .catch((bbb)=>{
            console.log(bbb)
        

        });*/
      })
      })
  });
});
}
