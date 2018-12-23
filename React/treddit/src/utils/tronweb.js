import Swal from 'sweetalert2'

import {a2hex, hex2a, Time2a} from "./parser"

const TronWeb = require('tronweb')


//connecting tronweb to the local docker node
const tronWeb = new TronWeb(
    "http://127.0.0.1:9090",
    "http://127.0.0.1:9090",
    "http://127.0.0.1:9090",
    'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0',
)

//address of the contract
const contractAddress = "TFwSiqbpkwyV6irAJ3QKpGwJcMoo2w6pZh";

export async function createNewPost(title, content, tags) {

    //notify the user that the post has been submitted
    Swal({title:'Post Transaction Submitted',
            type: 'info'
        });

    //load the contract 
    const contract = await tronWeb.contract().at(contractAddress);

    //convert the data to an appropriate format for the blockchain to handle
    let byteTitle = a2hex(title);
    let byteContent = a2hex(content);
    let byteTags = a2hex(tags);

    //submit the data to the blockchain
    contract.CreatePost(byteTitle, byteContent, byteTags).send({
        shouldPollResponse:true,
        callValue:0

    }).then(res => Swal({
        title:'Post Created Successfully',
        type: 'success'

    })).catch(err => Swal(
        {
             title:'Post Creation Failed',
             type: 'error'
        }
    ));

}

//get data from contract events and convert it into a readable/useable state
export async function getPosts() {

    //load the contract 
    const events = await tronWeb.getEventResult(contractAddress, 0, "PostContent", 0,  200, 1);

    var posts = []
    for(var i=0; i<events.length; i++){

        let address = events[i]['result']['author'];
        address = address.substring(2, address.length);
        address = tronWeb.address.fromHex(address)

        //format data so it can be used and stored better
        var post = {
            title: hex2a(events[i]['result']['title']),
            timestamp: Time2a(events[i]['result']['postTimestamp']),
            tags: hex2a(events[i]['result']['tags']),
            postid: events[i]['result']['id'],
            author: address,
            content: hex2a(events[i]['result']['text'])
          }

        posts = posts.concat(post);
    }

    localStorage.setItem("Posts", JSON.stringify(posts));

    return posts;
}

export async function createNewComment(commentText, postid,  parentComment) {

    //notify the user that the comment has been submitted
    Swal({title:'Comment Transaction Submitted',
            type: 'info'
        });

    //load the contract 
    const contract = await tronWeb.contract().at(contractAddress);

    //convert the data to an appropriate format for the blockchain to handle
    //let byteTitle = a2hex(title);
    let bytecommentText = a2hex(commentText);
    let id = "0x" + Number(postid).toString(16);

    //submit the data to the blockchain
    contract.PostComment(bytecommentText, id, "0x00").send({
        shouldPollResponse:true,
        callValue:0

    }).then(res => Swal({
        title:'Comment Posted Successfully',
        type: 'success'

    })).catch(err => Swal(
        {
             title:'Comment Post Failed',
             type: 'error'
        }
    ));

}

//get data from contract events and convert it into a readable/useable state
export async function getComments() {

    //load the contract 
    const events = await tronWeb.getEventResult(contractAddress, 0, "CommentCreated", 0,  200, 1);

    var comments = []
    for(var i=0; i<events.length; i++){

        let address = events[i]['result']['commenter'];
        address = address.substring(2, address.length);
        address = tronWeb.address.fromHex(address)
        //format data so it can be used and stored better
        var comment = {
            parentComment: hex2a(events[i]['result']['parentComment']),
            postid: events[i]['result']['postId'],
            author: address,
            content: hex2a(events[i]['result']['comment']),
            timestamp: Time2a(events[i]['result']['commentTimestamp']),
            commentid: events[i]['result']['commentId']
          }

          comments = comments.concat(comment);
    }

    localStorage.setItem("Comments", JSON.stringify(comments));

    return comments;
}

//get the vote counters from the blockchain
export async function getVoteCounters() {
    const contract = await tronWeb.contract().at(contractAddress);

    let posts = JSON.parse(localStorage.getItem("Posts"));
    let votes = [];

    for(var i=0; i<posts.length; i++){
        let pid = posts[i]['postid'];
        let id = "0x" + Number(pid).toString(16);
        let rawcall = await contract.getVotes(id).call();
        let value = tronWeb.toBigNumber(rawcall['_hex']).toNumber();
        console.log(value);
        console.log(rawcall);

        let postVote = {
            postid : pid,
            votes : value
        }
        votes = votes.concat(postVote);
    } 

    localStorage.setItem("PostVotes", JSON.stringify(votes));

}