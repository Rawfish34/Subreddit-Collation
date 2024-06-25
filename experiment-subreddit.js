const postsContainer=document.getElementById("posts-container")
var subreddit_arr=[];
const subreddit_list=document.getElementById("subreddit-list")
const sub_input=document.getElementById("sub-input");
const sub_button=document.getElementById("sub-btn");
const clear_all_button=document.getElementById("clear-btn")
const subsFromLocalStorage=JSON.parse(localStorage.getItem("subreddits"));
const sub_length_input=document.getElementById("sub-length");
const sub_length_button=document.getElementById("sub-length-btn");
var subLength=12;
var isSorted_likes=false;
var isSorted_date=false;
const likes=document.getElementById("likes");
const time_created=document.getElementById("time-created");


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
//sorter event listeners
likes.addEventListener("click",sort_subs)

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
    arr.forEach((sub,index)=>{
        fetchSubTopics(sub);
        
        var li=document.createElement("li");
        li.innerHTML=`${sub} <button class="delete-btn" data-index="${index}">Delete</button>`
        subreddit_list.appendChild(li);

        //Delete btn event listener
        const delete_btn=li.querySelector(".delete-btn");
        delete_btn.addEventListener("click", ()=>{
            deleteIndSub(index)
        })
    })
}

function deleteIndSub(index){
    subreddit_arr.splice(index, 1);
    localStorage.setItem("subreddits", JSON.stringify(subreddit_arr));
    process_subs(subreddit_arr);
}

function addSub(){
    subreddit_arr.push(sub_input.value);
    sub_input.value="";
    localStorage.setItem("subreddits", JSON.stringify(subreddit_arr));
    process_subs(subreddit_arr);
}


async function fetchSubTopics(subreddit){
    try{
        const response=await fetch(`https://www.reddit.com/r/${subreddit}/hot/.json?limit=${subLength}`);
        const data= await response.json();
        captureData(data);
    }
    catch (err){
        console.log(err)
    }
}

function captureData(data){
    
    const data_children=data.data.children;
    const children_arr_sliced=data_children.slice(0,`${subLength}`)
    console.log(children_arr_sliced);
    if (isSorted_likes){
        children_arr_sliced.sort((a,b)=>{
            if (a.data.ups<b.data.ups){
                return 1;
            }
            else if (a.data.ups>b.data.ups){
                return -1;
            }
        })
        
    }
    
    process_data(children_arr_sliced)
}

function process_data(obj){
    var subreddit_name=obj[0].data.subreddit;
    postsContainer.innerHTML+=`<div class="subreddit-title" style="font-size: 1.5rem; background-color: var(--medium-grey); font-family: 'Montserrat', sans-serif;">${subreddit_name}</div>`
    let html='';
    html=obj.map((post,index)=>{
        var info=post.data;
       
        const {title, ups, upvote_ratio, num_comments,permalink, created_utc, subreddit}=info;

        //GET TIME SINCE CREATED
        var timeSince=time_calc(created_utc)
        

        // Define thicker bottom border for the last row
        const isLastItem = index === obj.length - 1;
        const borderBottomStyle = isLastItem ? '4px solid var(--golden-yellow)' : '2px solid var(--test_color)';

        return`
        <tr style="border-bottom: ${borderBottomStyle};">
        <td>
        <a class="post-title" href="https://www.reddit.com/${permalink}" target="_blank">${title}</a>
        </td>
       <td>${ups}</td>
       <td>${timeSince}</td> 
       <td>${num_comments}</td>
       <td class="last-td">${upvote_ratio}</td>
        </tr>
        
        
        `
        }).join("");
    postsContainer.innerHTML+=html;
}

//SORT AND OTHER FLAVOR FUNCTIONS
function sort_subs(){
    isSorted_likes=!isSorted_likes;
    process_subs(subreddit_arr);
}

//TIME created since function
function time_calc(createdTime){
    const currentTime=Math.floor(Date.now()/1000)//in seconds
    const time_dif_seconds=currentTime-createdTime
    const minutes=Math.floor(time_dif_seconds/60);
    const hours=Math.floor(minutes/60);
    const days=Math.floor(hours/24);
    

    if (time_dif_seconds<60){
        return `${time_dif_seconds} seconds ago`;
    }
    else if (minutes<60){
        return `${minutes} minutes ago`
    }
    else if (hours<24){
        return `${hours} hours ago`
    }
    else {
        return `${days} days ago`
    }
}