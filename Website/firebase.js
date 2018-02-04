var config = {
        apiKey: "AIzaSyA1ea8MIJtvAOzC2OkwfeoEHpaGPXvlO-o",
        authDomain: "killtime-ucihack.firebaseapp.com",
        databaseURL: "https://killtime-ucihack.firebaseio.com",
        projectId: "killtime-ucihack",
        storageBucket: "",
        messagingSenderId: "481340732925"
      };
firebase.initializeApp(config);
var db = firebase.database();
var inforFromdb = [];
var addStuff = document.getElementById("xxxxx");
var button = document.getElementById("yyyyy");

button.addEventListener('click', (e)=>{
    var id  = Date.now();
    console.log("ccccc");
    e.preventDefault();
    db.ref('information/'+ id).set({
        id: id,
        locations: addStuff.value
    })
    addStuff.value = "";
});

var button1 = document.getElementById("bbbb");
var inputLookUp = document.getElementById("aaaafff");

const events = db.ref('information');

events.on('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childData = childSnapshot.val();
      var id = -1;
      var locations = '';
      var user = {id : childData['id'], location : childData['locations']};
      inforFromdb.push(user);
        //inforFromdb.push(user);

    });
});
var flag = true;
button1.addEventListener("click",(e)=>{
    console.log(inputLookUp.value);
    for(var key in inforFromdb){
        if(flag && inforFromdb[key].id == inputLookUp.value){
            alert(inforFromdb[key].location);
            flag=!flag;
        }
    }
    flag = true;
});


function error(err){
    console.log(err);
}