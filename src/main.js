import API from './api.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

// This url may need to change depending on what port your backend is running
// on.

const api = new API('http://127.0.0.1:5000');

let vaild = null;
const registerPage = document.getElementById('registerPage');
const loginPage  =document.getElementById('loginPage');
const homePage = document.getElementById('homePage');
const navigation = document.getElementById('navigation');
const profilePage = document.getElementById('profilePage');
const followButton =document.getElementById('followButton');
const addPostPage = document.getElementById('addPostPage');
const changeProfilePage = document.getElementById('changeProfilePage');

const deleteButton=document.getElementsByClassName('deleteButton');
const editButton=document.getElementsByClassName('editButton');
const updateProfileButton= document.getElementById('updateProfile');
 
document.getElementById('logoutButton').addEventListener('click',e=>{
	location.reload();
	console.log('reload');
});

document.getElementById('registerButton').addEventListener('click',e=>{
	loginPage.style.display='none';
	registerPage.style.display='block';
});

document.getElementById('backLogin').addEventListener('click',e=>{
	loginPage.style.display='block';
	registerPage.style.display='none';
	changeProfilePage.style.display='none';
});

document.getElementById('backHome').addEventListener('click',e=>{
	profilePage.style.display='none';
	homePage.style.display= 'block';
	addPostPage.style.display='none';
	updateProfileButton.style.display='none';
	changeProfilePage.style.display='none';
});

document.getElementById('submitButton').addEventListener('click',e=>{
	const username  = document.getElementById('inputUsername').value;
	const password  = document.getElementById('inputPassword').value;
	const confirmPassword  = document.getElementById('confirmPassword').value;	
	const email  = document.getElementById('email').value;
	const name  = document.getElementById('name').value;

	if(confirmPassword!==password){
		alert('Password inconsistent!');
		return;
	}
	else if(email==0 || name==0){
		alert('Email and name can not be empty!');
		return;	
	}else{
		const data = {
			"username": username,
			"password": password,
			"email": email,
  			"name": name
		};
		api.post('auth/signup',{
			body: JSON.stringify(data),
			headers: {
		    	'Content-Type': 'application/json'
		  	},
		})
    	.then(data=>{
    		console.log('TOKEN: ' , data);
    		alert("Register success!");
    	})
    	.catch(err=>{alert(err)})
	}
});

const myProfile=(token,username)=>{
	console.log('myProfile');
	homePage.style.display ='none';
	addPostPage.style.display = 'none';
	profilePage.style.display ='block';
	followButton.style.display='none';
	changeProfilePage.style.display = 'none';
	profile(token,username,true);
};

const changeProfile=(token)=>{
	console.log(token);
	profilePage.style.display='none';
	changeProfilePage.style.display='block';
	document.getElementById('saveProfileButton').addEventListener('click',e=>{
		const email  = document.getElementById('emailC').value;
		const name  = document.getElementById('nameC').value;
		const password  = document.getElementById('inputPasswordC').value;
		const confirmPassword  = document.getElementById('confirmPasswordC').value;
				
		if(confirmPassword!==password){
			alert('Password inconsistent!');
			return;
		}else if(email==0 || name==0){
			alert('Email and name can not be empty!');	
			return;
		}
		else{
			const payload ={
				"email": email,
				"name": name,
				"password": password,
			}
			api.put("user",{
				body: JSON.stringify(payload),
				headers: {
			    	'Content-Type': 'application/json',
			    	'Authorization':token,
			  	},
			})
			.then(data=>{
				alert('Change success');
			})
			.catch(err=>{alert(err)})		
		}
	})		
};

function deletePost(token,postId){
	console.log('deletePost function');
	api.delete('post?id='+postId,{headers: {'Authorization':token}})
	.then(data=>{
		console.log(data);
		document.getElementById("postProfile"+postId).remove();
		alert("Delete success")
	})
	.catch(err=>{alert(err)})
};

function editPost(token,postId){
	console.log('editPost function');
	const description= document.getElementById(postId);
	
	const edit = document.createElement('textarea');
	edit.value=description.textContent;
	const save = document.createElement('button');
	save.textContent = 'save';
	description.textContent='';

	description.appendChild(document.createElement("br"));
	description.appendChild(edit);
	description.appendChild(save);

	save.addEventListener('click',e=>{
		console.log(edit.value);
		if(edit.value==0){
			alert('Comment can not be empty');
			return;
		}
		description.textContent=edit.value;
		edit.remove();
		save.remove();
		const payload = {"description_text":edit.value}
		api.put('post?id='+postId,{
				body: JSON.stringify(payload),
				headers: {
			    	'Content-Type': 'application/json',
			    	'Authorization':token,
			  	},
			})
		.then(data=>{alert('Edit Success')})
		.catch(err=>{alert(err)})
	})
};

function readFile(){
	if(!this.files || !this.files[0]){return;}
	var FR = new FileReader();
	FR.addEventListener('load',e=>{
		const result = e.target.result;
		console.log(result);
		document.getElementById('imgDisplay').src = result;
	});
	FR.readAsDataURL(this.files[0]);
};

const addPost=(token)=>{	
	console.log('addPost function');

	homePage.style.display= 'none';
	addPostPage.style.display = 'block';
	profilePage.style.display='none';
	changeProfilePage.style.display='none';
	document.getElementById('upload').addEventListener('change',readFile);

	document.getElementById('postButton').addEventListener('click',e=>{
		const description = document.getElementById('description').value;	
		const src = document.getElementById('imgDisplay').src.split('data:image/png;base64,')[1];
		if(description==0){
			alert('Description cannot be empty');
			return;
		}
		if(src==undefined){
			alert('Please choose a png image');
			return;
		}
		const payload = {
			"description_text": description,
			"src": src,
		}
		api.post('post',{
			body: JSON.stringify(payload),
			headers: {
		    	'Content-Type': 'application/json',
		    	'Authorization':token,
		  	},
		})
		.then(data=>{
			console.log(data);
			alert("Upload success!")	
		})
		.catch(err=>{alert(err)})
	});		
};

const profile=(token,name,flag)=>{
	console.log('profile function');

	api.get('user?username='+name,{headers: {'Authorization':token}})
		 .then(data=>{
		 	var following = data['following'];
		 	const posts = data['posts'];
		 	document.getElementById('usernameP').textContent = 'Username: '+data['username'];
		 	document.getElementById('nameP').textContent ='Name: ' +data['name'];
		 	document.getElementById('emailP').textContent ='Email: '+ data['email'];
		 	document.getElementById('followedNum').textContent ='FollowedNum: '+ data['followed_num'];

		 	//print follow
		 	document.getElementById('following').textContent ='Following: ';
		 	for(let i=0;i<following.length;i++){
		 		api.get('user?id='+following[i],{headers: {'Authorization':token}})
			 	.then(data=>{
			 		const follower = document.createTextNode(data['username']+' ');
	  		 		document.getElementById('following').appendChild(follower);
			 	})
			 	.catch(err=>{alert(err)})
		 	}

		 	//check posts
			const postContainer = document.getElementById('posts');
			postContainer.textContent = ''; 
			if(flag==true){
				updateProfileButton.style.display='block';
	 			updateProfileButton.addEventListener('click',e=>changeProfile(token));
			}
		 	for(let i=0;i<posts.length;i++){
		 		const postId = posts[i];
		 		api.get('post?id='+postId,{headers: {'Authorization':token}})
			 	.then(data=>{	  		 		
		 			const cur = data['meta'];
		 			const src = data['src'];
		 			const postPart = document.createElement('div');
		 			postPart.className = 'postProfile';
		 			postPart.id = 'postProfile'+postId;
		 			const description = document.createElement('p');
		 			const time = document.createElement('p');
		 			const img = document.createElement('img');

		 			time.appendChild(document.createTextNode(new Date( cur['published']  * 1000).toLocaleString()));
		 			description.appendChild(document.createTextNode(cur['description_text']));
		 			description.id = postId;		
			 		img.src = 'data:image/png;base64,'+src;
	
			 		if(flag==true){
			 			const editButton = document.createElement('button');
			 			const deleteButton = document.createElement('button');
			 			editButton.className = 'editButton';
			 			editButton.appendChild(document.createTextNode('edit'))
			 			deleteButton.className = 'deleteButton';
			 			deleteButton.appendChild(document.createTextNode('delete'));
			 			editButton.addEventListener('click',e=>editPost(token,postId));
			 			deleteButton.addEventListener('click',e=>deletePost(token,postId))
			 			postPart.appendChild(editButton);
				 		postPart.appendChild(deleteButton);
			 		} 		
			 		postPart.appendChild(time);
		 			postPart.appendChild(description);
			 		postPart.appendChild(img);
		 			postContainer.appendChild(postPart);  		 	
			 	})
			 	.catch(err=>{alert(err)})
 			}		
 			return data['id'];	
 		})
 		.then(id=>{
 			// check follow
			api.get('user',{headers: {'Authorization':token}})
			.then(data=>{
				var myfollowingList = data['following'];
				for(let i=0;i<myfollowingList.length;i++){
					if(myfollowingList[i]==id){
						console.log('find it')
			 			followButton.style.backgroundColor='red';
			 			followButton.textContent = 'Followed';
					}
				}
			})
			.catch(err=>{alert(err)})
 		})
 		.catch(err=>{alert(err)})		
};

const profileRender=(token,username,user,feeds)=>{
	console.log('profileRender function');

	homePage.style.display ='none';
	profilePage.style.display='block';
	var flag =false;

	if(username===user.textContent){
		flag =true;
		followButton.style.display='none';	
	}else{
		followButton.style.display='block';
	}
	profile(token,user.textContent,flag);

	//
	followButton.addEventListener('click',e=>{
		const name = user.textContent;

		if(followButton.textContent==='Follow'){
			console.log('follow it');
			api.put('user/follow?username='+name,{headers: {'Authorization':token}})
			.catch(err=>{alert(err)})	

			followButton.style.backgroundColor='red';
			followButton.textContent = 'Followed';	
		}
		else if(followButton.textContent==='Followed'){
			console.log('cancel follow it');
			api.put('user/unfollow?username='+name,{headers: {'Authorization':token}})
			.catch(err=>{alert(err)})

			followButton.style.backgroundColor='lightblue';
			followButton.textContent = 'Follow';
		}
	});
};

const like=(token,username,likesNum,postId,likesList,container)=>{
	console.log('like function');

	//show likes
	const likeButton = document.createElement('button');
	likeButton.className = 'likeButton';
	likeButton.textContent = 'Likes:' + likesNum;
	likeButton.value = parseInt(likesNum);
	likeButton.id = postId;
	const showLikes = document.createElement('ul');

	for(let j in likesList){
		const like = document.createElement('li');
		var id =likesList[j];
	
		api.get('user?id='+id,{headers: {'Authorization':token}})
  		 .then(data=>{
  		 	like.textContent = data['username'];
  		 	if(username === data['username']){
  		 		like.id='myLike'+postId;
  		 		likeButton.style.backgroundColor='red';
  		 	}
  		 	showLikes.appendChild(like);
  		 })
  		 .catch(err=>{alert(err)})
	}	  	
  	container.appendChild(likeButton);	
  	container.appendChild(showLikes);
  	container.appendChild(document.createElement('br'));

  	//set likes
  	likeButton.addEventListener('click',e=>{
  		if(likeButton.style.backgroundColor ==='red'){
  			console.log('cancel like');
  			api.put('post/unlike?id='+likeButton.id,{headers:{'Authorization':token}});
  			likeButton.value =  parseInt(likeButton.value)-1;
  			console.log(likeButton.value);
  			likeButton.textContent = 'Likes:' +likeButton.value;
  			likeButton.style.backgroundColor='white';
  			var query = 'myLike'+likeButton.id;
  			console.log(query);
  			document.getElementById(query).remove();			
  		}
  		else{
  			console.log('like it!')
  			api.put('post/like?id='+likeButton.id,{headers:{'Authorization':token}});
  			likeButton.value =  parseInt(likeButton.value)+1;
  			console.log(likeButton.value);
  			likeButton.textContent = 'Likes:' +likeButton.value;
  			likeButton.style.backgroundColor='red';	
  			const newLike = document.createElement('li');
  			newLike.textContent = username;
  			showLikes.appendChild(newLike);
  		}
  	})
};

const commentShow=(token,username,commentList,container,feeds)=>{
	console.log('commentShow function');
	//show comments	
	for(let k in commentList){
		const commentPart = document.createElement('div');
		commentPart.className='comment';
		var showComments = commentList[k];
		const commentInfo = document.createElement('p');
		var commonTime = new Date(showComments['published']  * 1000).toLocaleString();
		const commentUser = document.createElement('u');
		commentUser.appendChild(document.createTextNode(showComments['author'])) ;	

		//render to profile page	
		commentUser.addEventListener('click',e=>profileRender(token,username,commentUser,feeds));
		const comment = document.createElement('p');
		comment.appendChild(document.createTextNode(showComments['comment']));
		commentInfo.appendChild(document.createTextNode(commonTime));
		commentPart.appendChild(commentUser);
		commentPart.appendChild(commentInfo);
		commentPart.appendChild(comment);
		container.appendChild(commentPart);
	}	
};

const commentSubmit=(token,username,addComment,comments,container)=>{
	console.log('commentSubmit function');

	const id = addComment.value;
	const newComment = document.createElement("textarea");
	const submitComment = document.createElement('button');
	submitComment.textContent = 'submit';
	container.appendChild(document.createElement('br'));
	container.appendChild(newComment);
	container.appendChild(submitComment);

	submitComment.addEventListener('click',e=>{
		console.log(newComment.value);
		console.log(id);
		console.log(token);

		const newEle=document.createElement('div');
		newEle.className='comment';
		const author = document.createElement('u');
		author.appendChild(document.createTextNode(username));
		const time = document.createElement('p');
		time.appendChild(document.createTextNode( new Date().toLocaleString()));
		const content = document.createElement('p');
		content.appendChild(document.createTextNode(newComment.value));
		var newNum= comments.value+1;
		
		const payload = {
			"comment": newComment.value,
		}
		api.put('post/comment?id='+id,{
			body: JSON.stringify(payload),
			headers: {
		    	'Content-Type': 'application/json',
		    	'Authorization':token,
				},
		})
		.then(data=>{
			newEle.appendChild(author);
			newEle.appendChild(time);
			newEle.appendChild(content);
			container.appendChild(newEle);
			comments.appendChild(document.createTextNode('Comments:'+ newNum));
			alert('Submit success');
		})
		.catch(err=>{alert(err)})
		newComment.remove();
		submitComment.remove();
	})
};

const showFeed=(p,n,token,username)=>{
	console.log('showFeed function');

	const feeds = document.createElement('div');
	feeds.id ='feeds';
	homePage.appendChild(feeds);
	const page = 'p='+p+'&n='+n;

	document.getElementById('myPage').addEventListener('click',e=>myProfile(token,username));

	api.get('user/feed?'+page,{headers: {'Authorization':token}})
	 .then(data=>{
	 	const obj = data['posts'];

	 	obj.sort((x,y)=>{  
			return (y['published'] - x['published']);
		});

	 	//post information
	 	for(let i in obj){ 	

	 		const container = document.createElement('div');
	 		container.className = 'feed';
	 		const post = document.createElement('div');
	 		post.className = 'post';

	 		var src = obj[i]['src'];
	 		var postId = obj[i]['id'];	
	 		var commentList = obj[i]['comments'];
	 		var commentsNum = obj[i]['comments'].length;
	 		container.id = 'post'+postId;
	 		
	 		var cur = obj[i]['meta'];
	 		var author = cur['author'];	
	 		var likesList= cur['likes'];
	 		var likesNum = cur['likes'].length;
	 		var text = cur['description_text'];
	 		var commonTime = new Date( cur['published']  * 1000).toLocaleString();

	 		// console.log(cur['published']);

	 		const info = document.createElement('p');
	 		const user = document.createElement('u')
	 		user.appendChild(document.createTextNode(author));

	 		//render to profile page	
	 		user.addEventListener('click',e=>profileRender(token,username,user,feeds));

	 		//post		
	 		const postDate = document.createTextNode(commonTime);
	 		info.appendChild(postDate);
	 		post.appendChild(user);
	 		post.appendChild(info);
	 		const content = document.createElement('p');
	 		content.appendChild(document.createTextNode(text));
			post.appendChild(content);
			container.appendChild(post);
	 		const img = document.createElement('img');
	 		img.src = 'data:image/png;base64,'+src;
	 		container.appendChild(img);	

	 		//like
	 		container.appendChild(document.createElement('br'));
			like(token,username,likesNum,postId,likesList,container);

			//comment
			const comments = document.createElement('p');
			comments.value= commentsNum;
			comments.appendChild(document.createTextNode('Comments:'+commentsNum));	
			const addComment = document.createElement('button');
			addComment.appendChild(document.createTextNode('Add a comment'));
			container.appendChild(comments);
			container.appendChild(addComment);	
			addComment.value = postId;		
			addComment.addEventListener('click',e=>commentSubmit(token,username,addComment,comments,container));	
			commentShow(token,username,commentList,container,feeds);
	 		feeds.appendChild(container);		
	 	}
	 })
	 .catch(err=>{alert(err)});
};

const logIn=()=>{
	console.log('logIn function');

	const username  = document.getElementById('username').value;
	const password  = document.getElementById('password').value;

	const data = {
		"username": username,
		"password": password,
	};

	api.post('auth/login',{
		body: JSON.stringify(data),
		headers: {
	    	'Content-Type': 'application/json'
	  	},
	})
	.then(data=>{
		vaild = data['token'];
		console.log(vaild);
		const token = 'Token ' + vaild;

		loginPage.style.display = 'none';
		navigation.style.display = 'block';
		homePage.style.display = 'block';
		addPostPage.style.display = 'none';
		console.log(username);
 		showFeed(0,10,token,username);

		document.getElementById('addPost').addEventListener('click',e=>addPost(token));
	})
	.catch(err=>{alert(err)})
};

document.getElementById('loginButton').addEventListener('click',e=>logIn());









	

