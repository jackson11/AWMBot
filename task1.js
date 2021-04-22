const mwn = require('mwn')
const fs = require('fs');


function pluck(array, key) {
  return array.map(o => o[key]);
}

function getParamsFromTextWithMatch(string,look,rep){
  var splitstring = string.split("\n")
  for (let i = 0;i<splitstring.length;i++){
    var returnstring = ""
    if (look.test(splitstring[i])){
      splitstring[i]=rep
      //{{Old peer review|reviewedname=ewokfp|archive=1}}
      return splitstring.join("\n")
    }else{
      return false
    }
  }
}   

const bot = new mwn({
  apiUrl: 'https://en.wikipedia.org/w/api.php',
  username: "AWMBot",
  password: "AWMBot@tev20kclgqbqtso0qt5u21jajrctn89v"
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
  "cmlimit": "50",
	"cmprop": "ids|title|type",
}).then(data => {
	bot.request({
	  "action": "query",
	  "prop": "redirects",
    "rdlimit": "max",
    "pageids": pluck(data.query.categorymembers,"pageid"),
  })
    .then(function(redirects) {
      var pgedit = []
      var ids = []
	    for(var i=0;i<redirects.query.pages.length;i++){
        var iter = redirects.query.pages[i]
        if (iter.redirects&&!(iter.title =="Template:Old peer review")&&!(iter.title=="Template:Old portal peer review")){
          pagemembers[iter.title]=iter
          ids.push(iter.pageid)
          pgedit.push(iter)
        }
      }
      bot.request({
        "action": "query",
        "prop": "revisions",
        "rvslots": "*",
        "rvprop": "content",
        "pageids": ids
      })
      .then(parsed => {  
        //console.log(parsed)
        parsed.query.pages.forEach((revcon)=>{
        var redirtitle = pagemembers[revcon.title].redirects[0].title.split(":")[1]
        console.log(redirtitle)
        var locatestring = /{{oldpeerreview|{{Old peer review/
        var hasparam = /reviewedname=/
        var replacestring = "{{Old peer review|"+"reviewedname="+redirtitle+"|archive=1}}"
        var formtext = revcon.revisions[0].slots.main.content
        bot.edit(revcon.title, rev => {
          
          var wikitext = getParamsFromTextWithMatch(rev.content,locatestring,replacestring) || false
          if (!wikitext){
            return
          }
          return {  // return parameters needed for [[mw:API:Edit]]
            text: wikitext,
            summary: '(BOT) Fixing broken old peer review link.',
            minor: true,
            bot: true
          }
        })
          .then((data)=>{
            console.log(data)
          })
          .catch((errortext)=>{
            console.log(errortext)
          });
      })
      })
  });
});
}
