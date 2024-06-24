const postsContainer=document.getElementById("posts-container")
var subreddit_arr=[];
const subreddit_list=document.getElementById("subreddit-list")
const sub_input=document.getElementById("sub-input");
const sub_button=document.getElementById("sub-btn");
const clear_all_button=document.getElementById("clear-btn")
const subsFromLocalStorage=JSON.parse(localStorage.getItem("subreddits"));
const sub_length_input=document.getElementById("sub-length");
const sub_length_button=document.getElementById("sub-length-btn");
var subLength=10;

//EVENT LISTENERS
sub_button.addEventListener("click",addSub)
sub_input.addEventListener("keydown",(e)=>{
    if (e.key==="Enter"){
        addSub();
    }
})
clear_all_button.addEventListener("click",clear_all)
sub_length_button.addEventListener("click", changeLength)
sub_length_input.addEventListener("keydown",(e)=>{
    if (e.key==="Enter"){
        changeLength();
    }
})

//LOCAL STORAGE
if (subsFromLocalStorage){
    subreddit_arr=subsFromLocalStorage;
    process_subs(subreddit_arr);
}

function clear_all(){
    localStorage.clear();
    subreddit_arr=[];
    process_subs(subreddit_arr);

}

//CHANGE LENGTH
function changeLength(){
    subLength=sub_length_input.value;
    process_subs(subreddit_arr);
    sub_length_input.value='';
}

//PROCESS ARRAY
function process_subs(arr){
    subreddit_list.innerHTML="";
    postsContainer.innerHTML="";
    arr.forEach((sub)=>{
        fetchSubTopics(sub);
        subreddit_list.innerHTML+=`<li>${sub}</li>`
    })
}

function addSub(){
    subreddit_arr.push(sub_input.value);
    sub_input.value="";
    localStorage.setItem("subreddits", JSON.stringify(subreddit_arr));
    process_subs(subreddit_arr);
}


async function fetchSubTopics(subreddit){
    try{
        const response=await fetch(`https://www.reddit.com/r/${subreddit}/hot/.json?limit=8`);
        const data= await response.json();
        captureData(data);
    }
    catch (err){
        console.log(err)
    }
}

function captureData(data){
    console.log(data)
    const data_children=data.data.children;
    const children_arr_sliced=data_children.slice(0,`${subLength}`)
    process_data(children_arr_sliced)
}

function process_data(obj){
    var subreddit_name=obj[0].data.subreddit;
    postsContainer.innerHTML+=`<tr class="subreddit-title">${subreddit_name}</tr>`
    let html='';
    html=obj.map((post,index)=>{
        var info=post.data;
       
        const {title, ups, upvote_ratio, num_comments,permalink,subreddit}=info;

        

        // Define thicker bottom border for the last row
        const isLastItem = index === obj.length - 1;
        const borderBottomStyle = isLastItem ? '4px solid var(--golden-yellow)' : '2px solid var(--test_color)';

        return`
        <tr style="border-bottom: ${borderBottomStyle};">
        <td>
        <a class="post-title" href="https://www.reddit.com/${permalink}" target="_blank">${title}</a>
        </td>
       <td>${ups}</td>
       <td>${upvote_ratio}</td>
       <td class="last-td">${num_comments}</td>
        </tr>
        
        
        `
        }).join("");
    postsContainer.innerHTML+=html;
}



