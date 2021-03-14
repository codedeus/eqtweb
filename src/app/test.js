// function MysteryCode(input){
//     let start = [0,1];
    
   
//     for(let i=0;i<input-1;i++){
      
//         let revStart =  start.slice().reverse();
//         start = start.map(function(s){
//             s = "0"+s;
//             return s;
//         });
       
     
//         revStart = revStart.map(function(r){
//             r = "1"+r;
//             return r;
//         });
        
//         start = start.concat(revStart);
      
//     }
    
//     return start.slice(Math.max(start.length - input, 1));
// }

